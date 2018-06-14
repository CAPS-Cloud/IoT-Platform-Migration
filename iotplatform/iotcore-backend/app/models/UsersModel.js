
module.exports = {
    name: {
        validation: /^\S+([ ]\S+)+$/,
        validation_error_message: 'Name is invalid.',
    },
    username: {
        validation: /^[a-z0-9_]{3,30}$/,
        validation_error_message: 'Username can contain only lowercase a-z, 0-9 and underscores. The length of username have to be between 3 and 30 characters long.',
    },
    role: {
        validation: /^(ADMIN|READ_ONLY)$/,
        validation_error_message: 'Role is invalid',
    }
}
