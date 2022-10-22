const router = require('express').Router()
const CoinGecko = require('@lib/coinGecko');
const auth = require('@middlewares/auth')
const limiter = require('@middlewares/ratelimiter')


router.get('/', [limiter, auth], (req, res) => {
    const CoinGeckoClient = new CoinGecko();
    CoinGeckoClient.coins.markets({
        vs_currency: req.query.vs_currency,
        order: req.query.order,
        per_page: req.query.per_page,
        page: req.query.page,
        sparkline: req.query.sparkline,
    }).then((data) => {
        res.status(200).json(data)
    });
})

module.exports = router