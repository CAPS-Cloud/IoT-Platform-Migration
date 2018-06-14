
module.exports = {
    responseError(res, message) {
        res.status(400).json({ message });
    },

    responseSystemError(res, error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    },
}
