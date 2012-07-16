* Add a link to download as CSV.

* HTTP
** Show the request too
** Render Link headers from the response

* Handle/follow redirects.

* Support basic authentication

* Support oauth authentication

* Allow the application to inline queries and templates. A collection
  can point to documents that contain queries and templates with link
  relations, the client should be able to fetch these and inline them.

  Might have to be done on the server side. Should probably make this
  an optional feature enabled with cookies or something.

* Usability: For usability for newcomers to C+J consider adding explanatory texts
  all over the application. Explain where data comes from, why
  something is missing (missing fields etc). Allow the user close
  warnings and have the browser remember which warnings has been
  silenced.

* Support uploading of c+j documents.

* Create a generator that users can use to create their own
  collection+json documents.

  Make interactive so people can collaborate on a single specification.
