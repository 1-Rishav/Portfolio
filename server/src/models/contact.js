const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'] },
    email: {
        type: String, required: [true, 'Email is required'], validate: {
            validator: function (email) {
                return String(email)
                    .toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    );
            },
            message: (props) => `Email (${props.value}) is invalid!`,
        },
    },
    phone: { type: String, required: [true, 'Number is required'] },
    business: { type: String, default: '' },
    describe: { type: String, default:''}

}, { timestamps: true });

const Contact = new mongoose.model('Contact', contactSchema);
module.exports = Contact;