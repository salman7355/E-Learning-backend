export const RegisterValidateScheme = {
  profilePicture: {
    notEmpty: {
      errorMessage: "PP must not be empty",
    },
  },
  role: {
    notEmpty: {
      errorMessage: "PP must not be empty",
    },
    isString: {
      errorMessage: "Name must be a string",
    },
  },
  balance: {
    notEmpty: {
      errorMessage: "PP must not be empty",
    },
  },
  name: {
    notEmpty: {
      errorMessage: "Name must not be empty",
    },
    isString: {
      errorMessage: "Name must be a string",
    },
  },
  email: {
    isEmail: {
      errorMessage: "Invalid Email",
    },
  },
  password: {
    isLength: {
      options: {
        min: 6,
        max: 30,
      },
      errorMessage: "Password must be more than 8 characters",
    },
    notEmpty: {
      errorMessage: "Password must not be empty",
    },
  },
  address: {
    notEmpty: {
      errorMessage: "Address must no be empty",
    },
  },
  area: {
    notEmpty: {
      errorMessage: "Area must no be empty",
    },
  },
  mobile: {
    notEmpty: {
      errorMessage: "Mobile must no be empty",
    },
    isLength: {
      options: {
        min: 11,
        max: 11,
      },
      errorMessage: "Invalid Mobile Number",
    },
    isString: {
      errorMessage: "Mobile Number must be a string",
    },
  },
};

export const LoginValidateScheme = {
  email: {
    isEmail: {
      errorMessage: "Invalid Email",
    },
  },
  password: {
    isLength: {
      options: {
        min: 6,
        max: 30,
      },
      errorMessage: "Password must be more than 8 characters",
    },
    notEmpty: {
      errorMessage: "Password must not be empty",
    },
  },
};
