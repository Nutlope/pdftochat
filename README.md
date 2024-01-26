<a href="https://www.pdftochat.com/">
  <img alt="PDFToChat – Chat with your PDFs in seconds." src="./public/og-image.png">
  <h1 align="center">PDFToChat</h1>
</a>

<p align="center">
  Chat with your PDFs in seconds. Powered by Together AI and Pinecone.
</p>

<p align="center">
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#common-errors"><strong>Common Errors</strong></a>
  ·
  <a href="#credits"><strong>Credits</strong></a>
  ·
  <a href="#future-tasks"><strong>Future Tasks</strong></a>
</p>
<br/>

## Tech Stack

- Next.js [App Router](https://nextjs.org/docs/app) for the framework
- Mixtral through [Together AI](https://dub.sh/together-ai) inference for the LLM
- M2 Bert 80M through [Together AI](https://dub.sh/together-ai) for embeddings
- [Langchain.js](https://js.langchain.com/docs/get_started/introduction/) for the RAG code
- [Pinecone](https://www.pinecone.io/) for the vector database
- [Bytescale](https://www.bytescale.com/) for the PDF storage
- [Vercel](https://vercel.com/) for hosting and for the postgres DB
- [Clerk](https://clerk.dev/) for user authentication
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Deploy Your Own

You can deploy this template to Vercel or any other host. Note that you'll need to:

- Set up [Together.ai](https://dub.sh/together-ai/)
- Set up [Pinecone](https://www.pinecone.io/)
- Set up [Bytescale](https://www.bytescale.com/)
- Set up [Clerk](https://clerk.dev/)
- Set up [Vercel](https://vercel.com/)

See the .example.env for a list of all the required environment variables.

## Common errors

- Check that you've created an `.env` file that contains your valid (and working) API keys, environment and index name.
- Check that you've set the vector dimensions to `768` and that `index` matched your specified field in the `.env variable`.
- Check that you've added a credit card on Together AI if you're hitting rate limiting issues due to the free tier

## Credits

- [Youssef](https://twitter.com/YoussefUiUx) for the design of the app
- [Mako](https://twitter.com/mayowaoshin) for the original RAG repo and inspiration
- [Joseph](https://twitter.com/Hacubu) for the langchain help
- Together AI, Bytescale, Pinecone, and Clerk for sponsoring

## Future tasks

These are some future tasks that I have planned. Contributions are welcome!

- [ ] Add a trash icon for folks to delete PDFs from the dashboard and implement delete functionality
- [ ] Try to optimize the langchain code I have to be as clear as possible
- [ ] Explore best practices for auto scrolling based on other chat apps like chatGPT
- [ ] Do some prompt engineering for Mixtral to make replies as good as possible
- [ ] Protect API routes by making sure users are signed in before executing chats
- [ ] Run an initial benchmark on how accurate chunking / retrieval are
- [ ] Research best practices for chunking and retrieval and play around with them – ideally run benchmarks
- [ ] Try out Langsmith for more observability into how the RAG app runs
- [ ] Add demo video to the homepage to demonstrate functionality more easily
- [ ] Upgrade to Next.js 14 and fix any issues with that
- [ ] Implement sources like perplexity to be clickable with more info
- [ ] Add analytics to track the number of chats & errors
- [ ] Make some changes to the default tailwind `prose` to decrease padding
- [ ] Add an initial message with sample questions or just add them as bubbles on the page
- [ ] Add an option to get answers as markdown or in regular paragraphs
- [ ] Implement something like SWR to automatically revalidate data
- [ ] Save chats for each user to get back to later in the postgres DB
- [ ] Bring up a message to direct folks to compress PDFs if they're beyond 10MB
- [ ] Use a self-designed custom uploader
- [ ] Use a session tracking tool to better understand how folks are using the site
- [ ] Add better error handling overall with appropriate toasts when actions fail
- [ ] Add support for images in PDFs with something like [Nougat](https://replicate.com/meta/nougat)
