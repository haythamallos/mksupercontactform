import React from 'react';


import {
  FormControl,
  InputLabel,
  Input,
  Button
} from "@material-ui/core";

const emailRegex = RegExp(
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);

const formValid = ({ formErrors, ...rest }) => {
  let valid = true;

  // validate form errors being empty
  Object.values(formErrors).forEach(val => {
    val.length > 0 && (valid = false);
  });

  // validate the form was filled out
  Object.values(rest).forEach(val => {
    val === null && (valid = false);
  });

  return valid;
};

class Contact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: null,
      email: null,
      message: null,
      formErrors: {
        fullName: "",
        email: "",
        message: ""
      }
    };
  }

  handlSubmit = e => {
    e.preventDefault();

    if (formValid(this.state)) {
      console.log(`
        -- SUBMITTING--
        Full Name:  ${this.state.fullName}
        Email:  ${this.state.email}
        Message:  ${this.state.message}
        `)
    }
    else {
      console.error('FORM INVALID - DISPLAY ERROR MESSAGE')
      
    }
  }

  handleChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };

    switch (name) {
      case 'fullName':
        formErrors.fullName = value.length < 3 ? 'minimum 3 characters required' : "";
        break;
      case 'email':
        formErrors.email = emailRegex.test(value) ? '' : 'invalid email address';
        break;
      case 'message':
        formErrors.message = value.length < 3  ? 'minimum 3 characters required' : "";
        break;
      default:
        break;
    }

    //this.setState({ formErrors, [name]: value }, () => console.log(this.state));
    this.setState({ formErrors, [name]: value });
  };

  render() {
    const { formErrors } = this.state;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: 20,
          padding: 20
        }}
      >
        <form style={{ width: "50%" }} noValidate onSubmit={this.handlSubmit}>
          <h1>Contact Form</h1>

          <FormControl margin="normal" fullWidth>
            <InputLabel htmlFor="name">Name</InputLabel>
            <Input id="name" type="text" name="fullName" placeholder="Full Name" onChange={this.handleChange} noValidate  className={formErrors.fullName.length > 0 ? "error" : null} />
            {formErrors.fullName.length > 0 && (
                <span className="errorMessage">{formErrors.fullName}</span>
              )}
          </FormControl>
          
          <FormControl margin="normal" fullWidth>
            <InputLabel htmlFor="email">Email</InputLabel>
            <Input id="email" type="email" name="email" placeholder="Email" onChange={this.handleChange} noValidate />
            {formErrors.email.length > 0 && (
                <span className="errorMessage">{formErrors.email}</span>
              )}
          </FormControl>

          <FormControl margin="normal" fullWidth>
            <InputLabel htmlFor="message">Message</InputLabel>
            <Input id="message" name="message" placeholder="Tell us what you want" multiline rows={10} onChange={this.handleChange} noValidate />
            {formErrors.message.length > 0 && (
                <span className="errorMessage">{formErrors.message}</span>
              )}
          </FormControl>

          <Button variant="contained" color="primary" size="medium" type="submit">
            Send
            </Button>
        </form>
      </div>
    );
  }
}

export default Contact;