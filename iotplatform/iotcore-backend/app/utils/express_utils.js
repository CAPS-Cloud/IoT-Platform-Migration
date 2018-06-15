
module.exports = {
    responseError(res, err) {
        res.status(400).json(err);
    },

    responseSystemError(res, err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
    },
}
