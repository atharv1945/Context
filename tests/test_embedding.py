
from sentence_transformers import SentenceTransformer

def run_embedding_test():
    try:
        print("--- Sentence Embedding Test ---")
        print("Loading model... (This may take a while on the first run)")
        
        # Load the pre-trained model
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        print("Model loaded. Encoding sentences...")
        
        # Sample sentences
        sentences = [
            "This is an example sentence for our hackathon project.",
            "Each sentence is converted into a vector."
        ]
        # Encode the sentences to get their embeddings
        embeddings = model.encode(sentences)
        
        print("Successfully encoded sentences.")
        print(f"Number of sentences: {len(sentences)}")
        print(f"Shape of the embeddings array: {embeddings.shape}")
        print("(This should be [Number of sentences, 384])")
        print("Embedding test complete.")

    except Exception as e:
        print(f"An error occurred during embedding test: {e}")

if __name__ == "__main__":
    run_embedding_test()