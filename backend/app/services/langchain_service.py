from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings  # Change to ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
import google.generativeai as genai
from datetime import datetime
from typing import List, Dict, Any
import arxiv
import asyncio
from ..core.config import get_settings
from ..models.paper import Paper

settings = get_settings()

class LangChainService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        
        # Update LLM initialization to use ChatGoogleGenerativeAI
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",  # Use gemini-pro instead of gemini-2.0-flash
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7
        )
        
        self.review_prompt = PromptTemplate(
            input_variables=["papers", "topic"],
            template="""Please write a comprehensive literature review on the topic: {topic}
            
            Based on the following papers:
            
            {papers}
            
            Focus on:
            1. Key findings and contributions
            2. Common themes and patterns
            3. Research gaps and future directions
            4. Critical analysis and synthesis
            
            Format the review in a clear, academic style with proper paragraphs.
            """
        )
        
        self.chain = self.review_prompt | self.llm
        
    async def fetch_papers(self, topic: str, max_papers: int) -> List[Paper]:
        """Fetch relevant papers from ArXiv."""
        client = arxiv.Client()
        search = arxiv.Search(
            query=topic,
            max_results=max_papers,
            sort_by=arxiv.SortCriterion.Relevance
        )
        
        # Convert the iterator to a list to make it compatible with async
        papers = list(client.results(search))
        
        return [
            Paper(
                id=paper.entry_id.split('/')[-1],
                title=paper.title,
                authors=[author.name for author in paper.authors],
                published=paper.published,
                summary=paper.summary,
                url=paper.pdf_url
            )
            for paper in papers
        ]
    
    async def process_papers(self, papers: List[Paper]) -> List[Dict[str, Any]]:
        """Process papers and prepare them for review generation."""
        documents = []
        for paper in papers:
            try:
                # Use arxiv client directly instead of ArxivLoader
                client = arxiv.Client()
                search = arxiv.Search(id_list=[paper.id])
                paper_doc = next(client.results(search))
                
                # Create document from paper content
                doc = {
                    "page_content": f"{paper_doc.title}\n\n{paper_doc.summary}",
                    "metadata": {
                        "title": paper_doc.title,
                        "authors": [author.name for author in paper_doc.authors],
                        "published": paper_doc.published,
                        "id": paper.id
                    }
                }
                
                # Split document into chunks
                chunks = await asyncio.to_thread(
                    self.text_splitter.split_text,
                    doc["page_content"]
                )
                
                # Add chunks to documents list
                documents.extend([{
                    "page_content": chunk,
                    "metadata": doc["metadata"]
                } for chunk in chunks])
                
            except Exception as e:
                print(f"Error processing paper {paper.id}: {str(e)}")
                continue
        
        return documents
    
    async def analyze_paper(self, text: str) -> str:
        """Analyze a single paper using Gemini."""
        prompt = f"""Analyze the following academic paper excerpt and extract key findings, methodology, and contributions:

{text}

Provide a concise analysis focusing on:
1. Main findings and contributions
2. Methodology used
3. Key implications
4. Limitations (if mentioned)

Format the response in a clear, academic style."""

        try:
            response = await asyncio.to_thread(
                lambda: model.generate_content(prompt).text
            )
            return response
        except Exception as e:
            print(f"Error analyzing paper: {str(e)}")
            return "Error analyzing paper content."
    
    async def generate_review(self, papers: List[Paper], topic: str) -> str:
        try:
            # Create papers context with numbered references
            papers_context = "\n\n".join(
                f"Reference {i+1}:\nTitle: {p.title}\nAuthors: {', '.join(p.authors)}\nSummary: {p.summary}"
                for i, p in enumerate(papers)
            )

            prompt = f"""As an academic researcher, generate a comprehensive literature review on {topic} based on the following papers. 
            
Context Papers:
{papers_context}

Requirements for the literature review:
1. Write in a formal academic style using clear, precise language
2. Critically analyze and synthesize the research findings
3. Use citation numbers in square brackets (e.g., [1], [2]) when referencing papers
4. Structure the review with these sections:
   - Introduction (brief context and importance of the topic)
   - Main body  (organized by themes/concepts, not by individual papers) (Don't mention Main body in the generated review text)
   - Research gaps and future directions
   - Conclusion
5. Use markdown formatting for section headers (e.g., ## Introduction)
6. Format the response in markdown, but do not include a table of contents
7. Highlight key findings, methodologies, and connections between papers
8. Identify patterns, contradictions, and gaps in the current research
9. Length should be comprehensive (around 1000-1500 words)

Important:
- Integrate citations naturally into sentences
- Compare and contrast findings from different papers
- Identify methodological strengths and limitations
- Maintain an objective, analytical tone
- Emphasize the significance of findings in the broader context of {topic}

Generate the literature review now:"""

            # Use invoke instead of generate_content and access content property
            response = await asyncio.to_thread(
                lambda: self.llm.invoke(prompt).content
            )
            return response

        except Exception as e:
            print(f"Error in generate_review: {str(e)}")
            raise

    async def _generate_with_retry(self, prompt: str, max_retries: int = 3) -> str:
        for attempt in range(max_retries):
            try:
                response = self.llm.invoke(prompt)
                return response.content  # Access content property here
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                await asyncio.sleep(1)  # Add delay between retries
                continue