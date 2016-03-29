WebCrawler ReadMe

-To turn-in your project, you should submit your (thoroughly documented) code along with three other files:

A Makefile that compiles your code.
	- Our program is NodeJs and does not require compilation, just ./webcrawler [username password]

A plain-text (no Word or PDF) README file. In this file, you should briefly describe your high-level approach, any challenges you faced, and an overview of how you tested your code.

A file called secret_flags containing all the secret flags of all group members, one per line, in plain ASCII.

High Level Design

We use the 'net' package which implements TCP Socket connections.

We track the websites visited in a global queue.  

We write the GET and POST requests to our connection stream, and will 'fill in' destination links that we accumulate in our queue.  

First we go to the homepage and use Reg-Ex to parse the response for our CSRF Token

We use regex to isolate the HTTP headers and interpret the fields/status code and act accordingly.

We implemented reconstructed Chunked responses.

We use regex to search for the hidden flag.

We use 301s as redirects to update our 'to visit' queue.

If it is a status code 500 we drop it from our to visit queue.

Also included are some early prototypes of our crawler and a mini test server that broadcasts the input page.  

