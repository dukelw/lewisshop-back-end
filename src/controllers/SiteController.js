class SiteController {
  index(req, res, next) {
    res.send("Home Page")
  }
}

module.exports = new SiteController()