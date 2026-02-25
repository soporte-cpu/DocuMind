try:
    from langchain.retrievers import ContextualCompressionRetriever
    print("langchain.retrievers OK")
except Exception as e:
    print(f"langchain.retrievers: {e}")

try:
    from langchain_community.retrievers import ContextualCompressionRetriever
    print("langchain_community.retrievers OK")
except Exception as e:
    print(f"langchain_community.retrievers: {e}")

try:
    from langchain.retrievers.document_compressors import LLMChainExtractor
    print("langchain.retrievers.document_compressors OK")
except Exception as e:
    print(f"langchain.retrievers.document_compressors: {e}")
