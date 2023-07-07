import app from "../src/app.js";
import supertest from "supertest";
import { prisma } from "../src/database/prisma-client.js";
import { error, success } from "../src/utils/response.js";

const req = supertest(app);
let loginCookie;

jest.mock("@prisma/client", () => {
  class prismaMock {
    users = {
      create: jest.fn().mockImplementation((value) => {
        value.data.emailValidated = false;
        value.data.id = this.generateId();
        value.data.photo = null;
        this.modelUser.push(value.data);
        return { ...value.data };
      }),
      findUnique: jest.fn().mockImplementation((args) => {
        const user = this.modelUser.find((u) => u.id === args.where.id);
        return user;
      }),
      findFirst: jest.fn().mockImplementation((args) => {
        const user = this.modelUser.find(
          (u) => u.username === args.where.username
        );
        return user;
      }),
      update: jest.fn(),
    };
    items = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    };
    modelUser = [];
    $disconnect = () => {};
    generateId() {
      let id = "";
      while (id.length < 11) {
        id += Math.floor(Math.random() * 10);
      }
      return id;
    }
  }
  return {
    PrismaClient: prismaMock,
  };
});

describe("user signup", () => {
  const data = {
    username: "wirawan",
    email: "wirawanmahardika10@gmail.com",
    fullname: "wirawan mahardika",
    password: "wirawan123",
  };
  it("should failed because of username length shouldn't less than 6 character", async () => {
    const sendData = { ...data, username: "wira" };
    const res = await req.post("/api/users/signup").send(sendData);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      ...error(403, "Username Character should'nt be less than 6"),
    });
  });

  it("should failed because of username length shouldn't be greater than 20 character", async () => {
    const sendData = {
      ...data,
      username: "wirawanmahardikawirawanmahardikawirawanmahardika",
    };
    const res = await req.post("/api/users/signup").send(sendData);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      ...error(403, "Username Character should'nt be higher than 20"),
    });
  });

  it("should failed because of email invalid", async () => {
    const sendData = {
      ...data,
      email: "wirawan@mahardika",
    };
    const res = await req.post("/api/users/signup").send(sendData);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ...error(403, "Email is not valid") });
  });

  it("should failed because of password strength", async () => {
    const sendData = {
      ...data,
      password: "12345678",
    };
    const res = await req.post("/api/users/signup").send(sendData);
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      ...error(403, "Password strength error"),
    });
    expect(res.body).toHaveProperty("warning");
    expect(res.body).toHaveProperty("suggestions");
    expect(res.body).toHaveProperty("passwordStrengthLevel");
  });

  it("should success signup", async () => {
    const res = await req.post("/api/users/signup").send(data);
    expect(res.body).toMatchObject({ ...success("Berhasil signup") });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("username");
    expect(res.body.data).toHaveProperty("fullname");
    expect(res.body.data).toHaveProperty("email");
  });
});

describe("user login", () => {
  const data = {
    username: "wirawan",
    email: "wirawanmahardika10@gmail.com",
    fullname: "wirawan mahardika",
    password: "wirawan123",
  };

  it("should error because username is not registered", async () => {
    const sendData = { username: "wira", password: data.password };
    const res = await req.post("/api/users/login").send(sendData);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ...error(401, "Username tidak terdaftar") });
  });

  it("should error because password incorrect", async () => {
    const sendData = { username: data.username, password: "wrong password" };
    const res = await req.post("/api/users/login").send(sendData);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ...error(401, "Password invalid") });
  });

  it("should success login", async () => {
    const sendData = { username: data.username, password: data.password };
    const res = await req.post("/api/users/login").send(sendData);

    loginCookie = res.headers["set-cookie"];
    expect(res.headers["set-cookie"]).not.toBeFalsy();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...success("Berhasil login") });
  });
});

describe("user logout", () => {
  test("should error because user never login", async () => {
    const res = await req.delete("/api/users/logout");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      ...error(401, "Anda harus login terlebih dahulu"),
    });
  });

  test("should success because user login already login", async () => {
    const res = await req
      .delete("/api/users/logout")
      .set("Cookie", loginCookie);

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeFalsy();
    expect(res.body).toEqual({ ...success("Berhasil logout") });
  });

  test("should error because user already logout so they can't access protected route", async () => {
    const res = await req.get("/").set("Cookie", loginCookie);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      ...error(401, "Anda harus login terlebih dahulu"),
    });
  });
});

describe("user forget-password", () => {
  test.todo("forget password feature");
});

////// ==> path /api/users/add-photo sudah dilakukan test manual menggunakan postman
