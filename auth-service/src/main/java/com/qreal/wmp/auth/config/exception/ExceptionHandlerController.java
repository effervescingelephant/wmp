package com.qreal.wmp.auth.config.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.NoHandlerFoundException;

/** Exceptions handler class for all Spring Framework controllers.*/
@ControllerAdvice
public class ExceptionHandlerController {

    private static final Logger logger = LoggerFactory.getLogger(ExceptionHandlerController.class);

    /** Handler for not found page exception. (404 page)*/
    @ExceptionHandler(NoHandlerFoundException.class)
    public String handleNotFoundException(Exception e) {
        logger.warn("Someone met 404 page", e);
        return "errors/404";
    }

    /** Handler for all other exceptions. */
    @ExceptionHandler(Exception.class)
    public ModelAndView handleException(Exception e) {
        logger.error("Someone met exception", e);
        ModelAndView modelAndView = new ModelAndView("errors/common");
        modelAndView.addObject("message", e.getMessage());
        return modelAndView;
    }
}
