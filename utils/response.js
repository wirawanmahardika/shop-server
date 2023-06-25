export const success = (description) => {
    return  {
        code: 200, 
        message: "OK",
        description
    }
}

export const error = (code, description) => {
    return {
        code,
        message: "NOT OK",
        description
    }
}