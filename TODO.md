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

* BUG: when executing queries, the URL in the "http response" section
  is not the correct url, it's missing the query parameters.

* Add an OpenSearch document to the root page so that people can add
  the site as an search engine.

# Document features

* Automatic paging
* Inline display of images (```<img>``` style)
* CR(U)D features

# Extra services

Having a set of services that shows off what a generic client can do
would be useful to show the eneric power of hypermedia.

* An 'unroller/pager' service

  Given any c+j list and a wanted page size (possibly unlimited), walk
  all 'next' links and create a new list.

  Useful as 1) a way to show that generic formats can lead to generic
  tools. The explorer itself is one tool, this service would be
  another.

  It might be useful for tools that doesn't do paging natively, or
  some third party want to ensure that the consumer is given a
  specific chunk size of data. Example applications include mobile
  phones, simple shell scripts etc.

  TODO: Since there's no way to tell what kind of data each link will
  give strictly speaking all links has to be rewritten to point back
  to the service. This might be very unefficient so make it possible
  to give a set of relations and/or names that it will automatically
  redirect through the service and leave the rest alone.

* 'atomizer' service

  It's too bad that C+J doesn't have a way to identify 'id' or 'last
  updated' fields, but it's always possible name fields that work as
  'id' or 'published'/'updated'. Given this it's possible to rewrite
  any c+j collection to atom (and some more perhaps).

* Generator

  Create a service that takes a single collection and follows a set of
  links/queries from the collection/each item and creates a new set.

* Filter/selector/projection/map

  Take a collection and run a JS-expression on the code, return those
  who doesn't evaluate to false.

* Reduce

  Given a collection + JS function, reduce the entire collection to a
  single item.

## Example usage

# List of all events for an organization

Github doesn't have a way to get a single feed for a
user/organization. The list for a repository contains commits, issue
and other stuff.

 1. Find all repositories for an organization/user
 1. for each repo, select all commits
 1. Merge by commit date
 1. (create atom feed)

Similar for all issues.
