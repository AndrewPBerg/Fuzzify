> Created: 3/11/2025 by @AndrewPBerg

# List of API endpoints

## Considerations for the API

- The api data should all be based on `{user_id}`
- All data should use JSON!
- how can we validate data (e.g. is this domain a correctly formatted URL)
- how can we validate a user (if at all)
- how can we handle errors, to explain what went wrong
- can all be implemented in `app.py` or broken up into modules like: `/api/get_requests.py`


## user_id
- all api endpoints should be dependent on the `user_id`

- `HEAD`: check if the `user_id` exists. Quicker than a standard GET
```python
@app.route('/api/{user_id}', methods=['HEAD'])
def get_user_id():
    """API endpoint to see if a user_id exists in the backend"""

    if request.method == "HEAD"
```

## Permutations

- `GET`: Used to fill in the tables in `DomainTable.tsx`. Should be based on the domain_name
- `POST`: Not sure on the usefulness of a post request to this endpoint. DNStwist table can probably be done locally on the backend service

```python
@app.route('/api/{user_id}/{domain_name}/permutations', methods=['GET, POST'])
def get_permutations():
    """API endpoint to fetch stored permutations for a given domain."""

    if request.method == "GET":
        ...
    if request.method == "POST":
        ...
```


## Settings

- `GET`: Used to get user settings on site refresh
- `PUT`: Used to create a new user (could also be replace with settings defaults)
- `PATCH`: Used to efficiently update the User settings in the backend

```python
@app.route('/api/{user_id}/settings', methods['GET, PUT, POST'])
def get_user_settings():
    """API endpoint to fetch stored settings for a user"""

    if request.method = "GET":
        ...
    if request.method = "PUT":
        ...
    if request.method = "POST":
        ...

```

## Domain
- `POST`: For the `DomainRootForm.tsx` to fill in the user's domains.
- `GET` : For the `DomainRootsList.tsx` useful for domain scheduling and validation.

```python
@app.route('/api/{user_id}/domain', methods=['POST, GET'])
def add_domain():
    """ API endpoint to insert domain-root(s) via DomainRootForm.tsx """
    if request.method = "GET":
        ...
    if request.method = "POST":
        ...

```

## Schedule

- TODO, later in project's scope
