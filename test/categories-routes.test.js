import app from "../src/app.js";
import supertest from "supertest";
import { prisma } from "../src/database/prisma-client.js";
import { error, success } from "../src/utils/response.js";

const req = supertest(app);
let loginCookieAdmin;
let loginCookieUser;

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
    categories = {
      create: jest.fn().mockImplementation((args) => {
        const newCategory = {
          id: this.generateId(),
          category: args.data.category,
        };
        this.modelCategories.push(newCategory);
        return newCategory;
      }),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockImplementation((args) => {
        const kategori = args.where.category.contains;
        if (!kategori) {
          return this.modelCategories;
        } else {
          const data = this.modelCategories.filter((u) =>
            u.category.includes(kategori.toLowerCase())
          );
          return data;
        }
      }),
    };
    modelUser = [
      {
        username: "dika123",
        email: "wirawanmahardika10@gmail.com",
        fullname: "wirawan mahardika",
        password:
          "$2b$12$j54ElHXRUgdRxIp/S2CIP.jimzZflvN9OxWFsuuvbIHKabAzJ4nwG",
        role: "admin",
        emailValidated: false,
        id: "46319573466",
        photo: null,
      },
    ];
    modelCategories = [
      { id: "38495536017", category: "baju" },
      { id: "43128759382", category: "sepatu" },
    ];

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

beforeAll(async () => {
  const data = {
    username: "wirawan",
    email: "wirawanmahardika10@gmail.com",
    fullname: "wirawan mahardika",
    password: "wirawan123",
  };
  await req.post("/api/users/signup").send(data);
  const res = await req
    .post("/api/users/login")
    .send({ username: "dika123", password: data.password });
  const res2 = await req
    .post("/api/users/login")
    .send({ username: "wirawan", password: data.password });

  loginCookieAdmin = res.headers["set-cookie"];
  loginCookieUser = res2.headers["set-cookie"];
});

describe("admin create new category", () => {
  test("should error because user isn't login yet", async () => {
    const sendData = { category: "celana" };
    const res = await req.post("/api/category").send(sendData);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      ...error(401, "Anda harus login terlebih dahulu"),
    });
  });

  test("should error because user is not admin", async () => {
    const sendData = { category: "celana" };
    const res = await req
      .post("/api/category")
      .send(sendData)
      .set("Cookie", loginCookieUser);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ...error(401, "Anda tidak memiliki izin") });
  });

  test("should create new items if the user role is admin", async () => {
    const sendData = { category: "celana" };
    const res = await req
      .post("/api/category")
      .send(sendData)
      .set("Cookie", loginCookieAdmin);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject(sendData);
    expect(res.body).toMatchObject({
      ...success("Berhasil membuat kategori baru"),
    });
  });
});

describe("get categories", () => {
  test("should get all categories", async () => {
    const res = await req.get("/api/category");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toMatchObject({
      ...success("Berhasil mengambil kategori"),
    });
  });

  test("should get categories based on input", async () => {
    const category = "sepatu";
    const res = await req.get("/api/category?category=" + category);

    expect(
      res.body.data.every((a) => a.category.includes(category.toLowerCase()))
    ).toBe(true);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toMatchObject({
      ...success("Berhasil mengambil kategori"),
    });
  });
});
