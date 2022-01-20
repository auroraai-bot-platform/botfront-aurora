
# REST API
This rest api provides a simple way to interact with the botfront container without the need of a meteor client.

## Implemented Methods

### **Health CHeck**
<details>

  ----
  Retuns 200 OK in case the API is active.

* **URL**

  /api
* **Method:**

  `GET`
  
*  **Headers**

   **Required:**

   None
  
*  **URL Params**

   **Required:**
 
   None

* **Data Params**

   None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** None
---

</details>
<br />

### **Create User**
<details>

----
  Creates a new user. The user is by default a global-admin. Custom roles can be provided in the optional parameters.

* **URL**

  /api/users

* **Method:**

  `PUT`
  
*  **Headers**

   **Required:**

   `Authorization=[string]`
  
*  **URL Params**

   **Required:**
 
   None

* **Data Params**

  ```json
  email: string;
  password: string;
  roles?: [           // provide  a specific role for the user to restrict its access rights
    {
      roles: string[],
      project: string
    }
  ];
  profile?: {
    firstName: string;
    lastName: string;
    preferredLanguage: string;
  };
  ```

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ email : "example@example.org" }`
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** None

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Missing email or password" }`

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Malformed or missing roles" }`<br />
    **Description** In case role information is provided

---

</details>
<br />

### **Create Project**
<details>

----
  Creates a new project. The projectId can be provided to make it easier to target specific projects with updates, without the need of looking them up.

* **URL**

  /api/projects

* **Method:**

  `PUT`
  
*  **Headers**

   **Required:**

   `Authorization=[string]`
  
*  **URL Params**

   **Required:**
 
   None

* **Data Params**

  ```json
  name: string;
  nameSpace: string; // MUST START with `bf-`
  baseUrl: string; // the url under which the rasa bot instance is reachable
  projectId?: string // OPTIONAL, the projectId  used for creating the project
  ```

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ projectId : "s4Mnft8s2" }`
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** None

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Malformed or missing inputs" }`<br />
    **Description** In case role information is provided

---

</details>
<br />

### **Import Project**
<details>

----
  Import a Rasa bot configuration into a project. It is important, that the projectId is existing.
  The data is provided as a single zip file. This file needs to contain all bot files. The files will be extracted and validated.
  If the validation result returns any error, the import will fail and return the error information.
  If the validation error is
  ```shell
  NLU data in this file could not be parsed by Rasa at <address>
  ```
  , then the rasa bot `Instance` for the project is not reachable or wrongly configured.

* **URL**

  /api/projects/import

* **Method:**

  `POST`
  
*  **Headers**

   **Required:**

   `Authorization=[string]`
  
*  **URL Params**

   **Required:**
 
   None

* **Data Params**

  ```json
  file: blob; // a single zip file containing all required files
  projectId: string // the projectId of the project, where the data will be imported to
  ```

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ projectId : [string] }`
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** None

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Provide a projectId" }`<br />

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Send exactly one zip file" }`<br />

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Failed to extract zip file" }`<br />

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Validation failed" }`<br />

  OR

  * **Code:** 500 BAD REQUEST <br />
    **Content:** `{ error: "Failed to validate extracted files" }`<br />

  OR

  * **Code:** 500 BAD REQUEST <br />
    **Content:** `{ error: "Invalid validation Result" }`<br />

---

</details>
<br />

### **Upload Image**
<details>

----
Webhook used by Botfront to persist images used by Botfront. The images need to be publicly accessible.
Uploads an image to S3 and return a publicly accessible url of that image. The endpoint does not require authorisation as it is only locally accessible.

* **URL**

  /api/images

* **Method:**

  `POST`
  
*  **Headers**

   **Required:**
  
*  **URL Params**

   **Required:**
 
   None

* **Data Params**

  ```json
  projectId: string,
  data: string, // image encoded in base64
  mimeType: string,
  language: string,
  responseId": string
  ```

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ uri : [string] }`
 
* **Error Response:**

  * **Code:** 400 Bad Request <br />
    **Content:** None

---

</details>
<br />

### **Delete Image**
<details>

----
  Webhook used by Botfront to delete images not used anymore by Botfront.
  Deletes an existing image file from S3. The endpoint does not require authorisation as it is only locally accessible.

* **URL**

  /api/images

* **Method:**

  `DELETE`
  
*  **Headers**

   **Required:**
  
*  **URL Params**

   **Required:**
 
   None

* **Data Params**

  ```json
  projectId: string
  uri: string
  ```

* **Success Response:**

  * **Code:** 204 <br />
    **Content:** `{ projectId : [string] }`
 
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** None
  
  * **Code:** 400 Bad Request <br />
    **Content:** None
---

</details>
<br />

### **Deploy project**
<details>

----
  Webhook used by Botfront to deploy model into S3 storage.
  The endpoint does not require authorisation as it is only locally accessible.

* **URL**

  /api/deploy

* **Method:**

  `POST`
  
*  **Headers**

   **Required:**
  
*  **URL Params**

   **Required:**
 
   None

* **Data Params**

  ```json
  projectId: string,
  path: string
  ```

   **Required:**
 
   None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ uri : [string] }`
 
* **Error Response:**

  * **Code:** 400 Bad Request <br />
    **Content:** None
---

</details>
<br />

