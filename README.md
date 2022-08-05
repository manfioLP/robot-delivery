# robot-delivery

This is a simple/mock/basic version of a service that uses cartesians coordinates to choose which robot-delivery is the most suitable one to make the deliver.

The service was built entirely Serverless to make it easy and fast to develop and test in production if thats a solution :)


### :bookmark_tabs: Requirements

---
* npm [properly installed](https://www.npmjs.com/get-npm)
* Atlas MongoDB .env vars [configured or provided by email](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/)
* Node.js@12.11.3 (or higher) [properly installed](https://nodejs.org/en/download/package-manager/)
* Serverless CLI [properly installed](https://www.serverless.com/framework/docs/getting-started)

### :arrow_forward: Installation

---

`git clone https://github.com/manfioLP/robot-delivery.git`

`cd robot-delivery`

`npm install` then `sls offline start`

This will mock an Gateway locally on localhost:3000, then you can make all the API calls wanted.

Just please note that the first request may take some time because of *lambda cold start* (and also since it's for test purposes, we provisioned everything on free-tiers)

Also you can just run `npm run test` and it will run all unit tests created and show its coverage. But don't worry! It uses a different DB hosted on Atlas to make sure no data is messed. It's also torn down it once the tests are finished.
### :pushpin: Roadmap

---

- [x] Create basic structure to define which robot shall get the delivery.
- [ ] Add handler to update flat fee rate
- [ ] Finish the logics to free the Robot once it arrives destination.
- [ ] Fix tests run on CI/CD 
- [ ] Migrate to Typescript
- [ ] Make more integration tests

### :warning: Known issues

---
* **Circle CI tests not working** - Test environment on CI/CD is currently broken for some environment reasons.

### :pencil2: Endpoints

---

* `[POST] v1/robot/add`: 
  * Requires: ```name(String) | locationX(Number -> cartesian cordinate) | locationY(Number -> cartesian cordinate) | ?type(String enum)```
  * It provisions a Robot in the service, this robot will be given deliveries once requested.
* `[GET] v1/robot/move`:
    * Requires: ```just a [GET], no params```
    * It moves (changes locationX and locationY to a random position) for all robots inside the platform. Used mainly for test purposes.
* `[GET] v1/robot/all`:
    * Requires: ```pagination (skip and limit), but its optional```
    * It fetches all robots inside the platform.
* `[POST] v1/robot/add`:
    * Requires: ```name(String) | locationX(Number -> cartesian cordinate) | locationY(Number -> cartesian cordinate) | ?type(String enum)```
    * It provisions a Robot in the service, this robot will be given deliveries once requested.
* `[POST] v1/quote`:
    * Requires: requires a BODY with ```pickup: {locX: Number, locY: Number} | delivery: {locX: Number, locY: Number}``` which are the coordinates for both pickup and delivery.
    * It creates a quote with status pending, if its the user's wish, he can then PUT into ``quote/{id}`` to order the delivery.
* `[PUT] v1/quote/{id}`:
    * Requires: ```just the quote id as pathParameter```
    * This is where the magic happens, we calculate the distance (based on the cartesian system) and then we cross with our closest robots positions to assign que delivery to the closest.one (taking into account the sum of distance to pickup + deliver).
    * But beware! If the pickup is too far (we check for robots in the range of [100+ pickup point - 100]), no robot will be shown and assign to your delivery!