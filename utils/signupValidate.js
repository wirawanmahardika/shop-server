import zxcvbn from "zxcvbn";
import { error } from "./response.js";
import emailValidator from 'email-validator'


export function signupValidate(req,res,next) {
    const { username, password, email, ...data } = req.body

    if(username.length < 6) {
        return res.status(403).json({...error(403, 'Username Character should\'nt be less than 6')})
    }
    if(username.length > 20) {
        return res.status(403).json({...error(403, 'Username Character should\'nt be higher than 20')})
    }

    if(!emailValidator.validate(email)) {
        return res.status(403).json({...error(403, 'Email is not valid')})
    }

    const passwordTestResult = zxcvbn(password)

    if(passwordTestResult.score < 3) {
        return res.status(403).json({...error('Forbidden'), 
            score: passwordTestResult.score,
            warning: passwordTestResult.feedback.warning || 'bad password',
            suggestions: passwordTestResult.feedback.suggestions
        })
    }

    return next()
}