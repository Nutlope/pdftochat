# PDFtoChat

## Todos v1.5

- [ ] Implement design changes on the pdf page: chatbot scroll
- [ ] Make sure it's fully responsive on mobile
- [ ] Implement sources like perplexity with more info
- [ ] Make some changes to the default tailwind `prose`
- [ ] Add my own google cloud project to Clerk and create a production instance
- [ ] Spin up good README + tweet

## Future Todos

- [ ] Add an initial message with sample questions or just add them as bubbles
- [ ] Add a trash icon for folks to delete PDFs and implement delete functionality
- [ ] Add an option to get answers as lists or paragraphs
- [ ] Save chats for each user to get back to later
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
- Check that you've set the vector dimensions to `768`.
- Make sure your pinecone namespace is in lowercase.

## Credit

- Mako for the original RAG repo
- Joseph for help and for his langchain next.js repo
- Together AI, Bytescale, Pinecone, and Clerk for sponsoring
