const router = require("express").Router();

router.get('/', (req, res) => res.json({ test: "its working"}));

module.exports = router;