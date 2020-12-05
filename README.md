# Volunteer Finder API

## Documentation
This API works with two entities: causes and organizations.

### Causes
Causes represent a cause that an organization could support.  They include the following fields:
* id: unique for each cause
* cause_name

#### Causes Endpoints
**GET /api/causes** - Responds with a JSON object that is a list of all causes.

**GET /api/causes/:id** - Responds with a JSON object of the cause with the specified id if it exists.  Otherwise, responds with JSON object with the message: “Cause with id <id> does not exist”.

### Organizations
Organizations represent an organization that can accept volunteer workers in some capacity to support them, whether short term or long term.  They include the following fields:
* id: unique for each organization
* org_name
* website
* phone: a phone number to reach the organization
* email: an email address to reach the organization
* org_address
* org_desc: a description of the organization

#### Organizations Endpoints
**GET /api/orgs** - Responds with a JSON object that is a list of all organizations, each of which has a ‘causes’ field that is a list of its causes.
* Query Parameters:
  * search term: restricts the response to only include organizations where the search term can be found in their name, description, or address
  * causes: restricts the response to only include organizations that have at least one of these causes

**GET /api/orgs/:id** - Responds with a JSON object of the organization that has the specified id, if it exists, including a ‘causes’ field that is a list of the organization's causes. If the organization doesn’t exist, this endpoint responds with a 404 status and a JSON object with the message: “Organization with id <id> does not exist”.

**POST /api/orgs** - Adds the organization to the database and updates all associated database tables. Expects the organization to be included in the request body as JSON.	If the organization has any causes, then they must be included in the organization’s ‘causes’ field as a list of cause objects. If the validation requirements are not met, this endpoint responds with a 400 status and a JSON object that includes a semi-colon-separated list of error messages for each validation requirement that failed.  Otherwise, if the organization is successfully added to the database, this endpoint responds with a JSON object with the new organization, with its id, and without its list of causes.
o	PATCH /api/orgs/:id
* Validation Requirements for fields in the request body:
  * org_name is required and must be a string
  * website, if included, must be a string
  * phone, if included, must be a string
  * email, if included, must be a string
  * org_address, if included, must be a string
  * org_desc is required and must be a string
  * causes, if included, must be an array of cause objects that include an id that is a number, and a ‘cause_name’ that is a string

**PATCH /api/orgs/:id** - Updates the organization with the specified id, if it exists, using the JSON object of fields included in the request body. If the organization doesn’t exist, this endpoint responds with a 404 status and a JSON object with the message: “Organization with id <id> does not exist”.	If the organization has any causes, then they must be included in the organization’s ‘causes’ field as a list of cause objects. If the validation requirements aren’t met, this endpoint responds with a 400 status and a JSON object with a semi-colon-separated list of error messages for each validation requirement that failed.  Otherwise, if the organization is successfully updated in the database, this endpoint responds with a 201 status.
* Validation Requirements for fields in the request body:
  * At least one of the following fields must be included: org_name, website, phone, email, org_address, org_desc, causes
  * org_name, if included, must be a string
  * website, if included, must be a string
  * phone, if included, must be a string
  * email, if included, must be a string
  * org_address, if included, must be a string
  * org_desc, if included, must be a string
  * causes, if included, must be an array of cause objects that include an id that is a number, and a ‘cause_name’ that is a string

**DELETE /api/orgs/:id** - Deletes the organization with the specified id if it exists.	If the organization doesn’t exist, this endpoint responds with a 404 status and a JSON object with the message: “Organization with id <id> does not exist”.	Otherwise, if the organization is successfully removed from the database, this endpoint responds with a 204 status.

## Technologies Used
* Node JS
* Express
* PostgreSQL
