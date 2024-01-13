class SiteController {
  index(req, res, next) {
    console.log(a);
    res.send("Home Page");
  }
}

module.exports = new SiteController();
