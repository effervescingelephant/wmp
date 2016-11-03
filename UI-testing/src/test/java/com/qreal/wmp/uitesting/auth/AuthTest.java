package com.qreal.wmp.uitesting.auth;

import com.codeborne.selenide.WebDriverRunner;
import com.qreal.wmp.uitesting.config.AppInit;
import io.github.bonigarcia.wdm.ChromeDriverManager;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import static com.codeborne.selenide.Condition.appear;
import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selenide.$;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = AppInit.class, loader = AnnotationConfigContextLoader.class)
public class AuthTest {

    @Autowired
    private Auther auther;

    @Autowired
    private Opener opener;

    private WebDriver driver;

    /** Setup ChromeDriverManager. */
    @BeforeClass
    public static void init() {
        ChromeDriverManager.getInstance().setup();
    }

    /** Setup browser. */
    @Before
    public void runDriver() {
        driver = new ChromeDriver();
        WebDriverRunner.setWebDriver(driver);
    }

    /**
     * Try to login with correct username and password.
     * Should redirect to OAuth page.
     */
    @Test
    public void authTest() {
        opener.cleanOpen("auth");
        $(byText("Sign in to continue to Auth")).shouldBe(exist);
        auther.auth();
        $(byText("OAuth Server")).waitUntil(appear, 5000);
    }

    /**
     * Try to login with random username and password.
     * An error must be shown.
     */
    @Test
    public void authWrongTest() {
        opener.cleanOpen("auth");
        $(byText("Sign in to continue to Auth")).shouldBe(exist);
        char[] alphabet = "abcdefghijklmnopqrstuvwxyz0123456789".toCharArray();
        String wrongLogin = RandomStringUtils.random(20, alphabet);
        String wrongPassword = RandomStringUtils.random(20, alphabet);
        auther.auth(wrongLogin, wrongPassword);
        $(byText("Password or login wrong")).waitUntil(appear, 5000);
    }

    /**
     * Try to open dashboard page without authentication.
     * Should be redirected to auth page.
     * Try to open dashboard page with correct login and password.
     */
    @Test
    public void dashboardTest() {
        opener.cleanOpen("dashboard");
        $(byText("Sign in to continue to Auth")).shouldBe(exist);
        opener.open("dashboard");
        $(byText("Dashboard")).waitUntil(appear, 5000);
    }

    /**
     * Try to open editor page without authentication.
     * Should be redirected to auth page.
     * Try to open editor page with correct login and password.
     */
    @Test
    public void editorTest() {
        opener.cleanOpen("editor");
        $(byText("Sign in to continue to Auth")).shouldBe(exist);
        opener.open("editor");
        $(byText("Property Editor")).waitUntil(appear, 5000);
    }

    /** Close the browser. */
    @After
    public void stopDriver() {
        driver.close();
    }
}