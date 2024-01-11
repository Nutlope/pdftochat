# PDFtoChat

## Todos v0.5

- [x] Base functionality working w/ pinecone and openai
- [x] Add upload component for pdfs
- [x] Figure out how to acccept remote pdfs
- [x] Move ingest-data file into an API route
- [x] Add logic to run the ingest-data file with the userID + timestamp after user has uploaded a file
- [x] Don't show the chat unless the ingesting was successful, add loading state for ingesting
- [x] In the prompt, add giving back the answer as HTML or markdown to format it well
- [x] Figure out how to use namespaces so folks can search their own PDFs
- [x] Add a PDF viewer
- [x] Migrate to the app router
- [x] Clean up files
- [x] Have PDF viewer and chat side by side
- [x] Add auth with Clerk
- [x] Make the correct pdf show up in the viewer by adding Postgres DB (docId, userId, pdfUrl, createdAt)
- [x] Restrict users to 3 PDFs per account
- [x] Make UI better overall
- [x] Implement the new UI for the document page

## Todos v1

- [x] Add US region on pinecone by upgrading account
- [x] Verify data is streaming back in general
- [x] Stream data back to the frontend somehow – Vercel AI SDK or my own streaming lib the Vercel AI SDK on the backend
- [x] Add sources with a page number
- [x] Migrate all CSS modules to tailwind
- [x] Implement design changes on pdf page pt.1
- [x] Fix the sign in and sign up pages to be outside of the layout
- [x] Implement the landing page UI
- [ ] Implement design changes on pdf page
  - [ ] avatars + chatbox scroll
  - [ ] responsiveness on mobile
- [ ] Add loading UI for ingesting data
- [ ] Add SEO metadata in layout.tsx
- [ ] Add an initial message with sample questions or just add them as bubbles
- [ ] Migrate to Together Inference (mixtral)
- [ ] Migrate to Together Embeddings
- [ ] Migrate to the latest version of Clerk and update Clerk env vars
- [ ] Cite sources in the answers and automatically take the user to that page in the PDF

## Future Todos

- [ ] Add a trash icon for folks to delete PDFs and implement delete functionality
- [ ] Add an option to get answers as lists or paragraphs
- [ ] Use an observability tool to better understand how people are using the site
- [ ] Clean up and customize how the PDF viewer looks
- [ ] Bring up a message to compress PDFs if they're beyond 10MB or accept more
- [ ] Migrate to the latest bytescale library and use a nicer custom uploader
- [ ] Add better error handling overall with appropriate toasts
- [ ] Add rate limiting for uploads
- [ ] Upgrade to Next.js 14
- [ ] Add support for images in PDFs with something like [Nougat](https://replicate.com/meta/nougat)
- [ ] Use KV for caching results

## Common errors

- Check that you've created an `.env` file that contains your valid (and working) API keys, environment and index name.
- Make sure your pinecone dashboard `environment` and `index` matches the one in the `pinecone.ts` and `.env` files.
- Check that you've set the vector dimensions to `1536`.
- Make sure your pinecone namespace is in lowercase.

## Credit

- Mako for the original RAG repo
- Joseph for help and for his langchain next.js repo
- Together AI, Bytescale, Pinecone, and Clerk for sponsoring
