const express = require('express');
const router = express.Router();

/**
 * 提交分数
 * @method commitScore
 * @argument {Number} score 分数
 */
router.post('/score', (req, res, next) => {
    const score = req.body.score;
    console.log(`提交分数：${score}`);
    res.send({
        code: 0
    });
});

/**
 * 提交分享
 * @method commitShare
 */
router.post('/share', (req, res, next) => {
    console.log('提交分享');
    res.send({
        code: 0
    });
});

module.exports = router;