import os
import tempfile
import logging
from typing import AsyncGenerator, Dict, Any
from urllib.parse import urlparse
import requests
import arxiv

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from ..core.config import get_settings
from ..utils.input_validation import extract_upload_hash, is_valid_arxiv_id

logger = logging.getLogger(__name__)
settings = get_settings()


class PaperChatService:
    def __init__(self):
        try:
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY not found in environment variables")

            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=settings.GEMINI_API_KEY,
            )

            self.llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.7
            )
        except Exception as e:
            logger.error(f"Failed to initialize PaperChatService: {str(e)}")
            raise

    async def chat_with_paper_stream(
        self,
        paper_id: str,
        message: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Chat with a paper using streaming responses.
        
        Handles both arXiv papers and uploaded PDFs.
        """
        temp_pdf_path = None
        
        try:
            # Fetch paper with path traversal protection
            if paper_id.startswith("upload_"):
                # Validate upload ID format to prevent path traversal
                content_hash = extract_upload_hash(paper_id)
                if not content_hash:
                    yield {
                        "content": "Error: Invalid uploaded paper ID format",
                        "sources": []
                    }
                    return
                
                pdf_path = os.path.join("uploads", f"{content_hash}.pdf")
                
                if not os.path.exists(pdf_path):
                    yield {
                        "content": "Error: Uploaded PDF file not found",
                        "sources": []
                    }
                    return
                
                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                    with open(pdf_path, "rb") as f:
                        tmp.write(f.read())
                    temp_pdf_path = tmp.name
            else:
                # Validate arXiv ID format
                if not is_valid_arxiv_id(paper_id):
                    yield {
                        "content": "Error: Invalid paper ID format",
                        "sources": []
                    }
                    return
                
                # Fetch from arXiv
                try:
                    client = arxiv.Client()
                    search = arxiv.Search(id_list=[paper_id])
                    arxiv_paper = next(client.results(search))
                    
                    # SSRF protection: validate the PDF URL host
                    pdf_url = arxiv_paper.pdf_url
                    parsed_url = urlparse(pdf_url)
                    allowed_hosts = {"arxiv.org", "export.arxiv.org", "www.arxiv.org"}
                    if parsed_url.hostname not in allowed_hosts:
                        yield {
                            "content": "Error: Invalid PDF source",
                            "sources": []
                        }
                        return
                    
                    response = requests.get(pdf_url, timeout=30)
                    response.raise_for_status()
                    
                    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                        tmp.write(response.content)
                        temp_pdf_path = tmp.name
                except StopIteration:
                    yield {
                        "content": "Error: Paper not found on arXiv",
                        "sources": []
                    }
                    return
                except Exception as e:
                    yield {
                        "content": f"Error fetching paper: {str(e)}",
                        "sources": []
                    }
                    return
            
            # Process PDF
            try:
                loader = PyPDFLoader(temp_pdf_path)
                documents = loader.load()
                
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200,
                    separators=["\n\n", "\n", " ", ""]
                )
                texts = text_splitter.split_documents(documents)
                
                # Create vector store
                vectorstore = FAISS.from_documents(texts, self.embeddings)
                
                # Create QA chain
                chat_prompt = PromptTemplate.from_template(
                    """You are a knowledgeable research paper expert. Answer the following question based on the paper content:
                    
Context: {context}
Question: {question}

Provide a clear, detailed response with specific references to the paper where relevant."""
                )

                qa_chain = ConversationalRetrievalChain.from_llm(
                    llm=self.llm,
                    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
                    return_source_documents=True,
                    combine_docs_chain_kwargs={"prompt": chat_prompt}
                )

                # Get response
                result = qa_chain({"question": message, "chat_history": []})
                
                # Stream response
                response = result["answer"]
                chunk_size = 100
                
                for i in range(0, len(response), chunk_size):
                    chunk = response[i:i + chunk_size]
                    yield {
                        "content": chunk,
                        "sources": [
                            {"page": doc.metadata.get("page", 0)}
                            for doc in result["source_documents"]
                        ] if i == 0 else []
                    }

            except Exception as e:
                logger.error(f"Error processing document: {str(e)}")
                yield {
                    "content": f"Error processing document: {str(e)}",
                    "sources": []
                }
        
        finally:
            if temp_pdf_path and os.path.exists(temp_pdf_path):
                try:
                    os.unlink(temp_pdf_path)
                except Exception as e:
                    logger.warning(f"Error cleaning up temp file: {str(e)}")
