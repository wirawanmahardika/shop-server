import app from "../src/app.js";
import supertest from "supertest";
import { image1, image2, image3 } from "./utils/blobImages.js";
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
    brands = {
      create: jest.fn().mockImplementation((args) => {}),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockImplementation((args) => {
        const queryData = args.where.name_brand.contains;
        console.log(args);
        if (!queryData) {
          return this.modelBrands;
        }

        const returnData = this.modelBrands.filter((d) => {
          return d.name_brand.includes(queryData);
        });
        console.log(returnData);
        return returnData;
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
      { id_category: "38495536017", category: "baju" },
      { id_category: "43128759382", category: "sepatu" },
    ];
    modelBrands = [
      {
        id_brand: "38495536017",
        name_brand: "baju",
        brand_photo: "thisisimageblob1",
      },
      {
        id_brand: "43128759382",
        name_brand: "sepatu",
        brand_photo: "thisisimageblob2",
      },
    ];

    $disconnect() {}
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

describe("get brand", () => {
  test("should get brand", async () => {
    const allBrands = [
      {
        id_brand: "38495536017",
        name_brand: "baju",
        brand_photo: "thisisimageblob1",
      },
      {
        id_brand: "43128759382",
        name_brand: "sepatu",
        brand_photo: "thisisimageblob2",
      },
    ];
    const res = await req.get("/api/brands");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(allBrands);
    expect(res.body).toMatchObject({
      ...success("Berhasil mengambil kategori"),
    });
  });

  test("should get brand based on query", async () => {
    const brand = "sepatu";
    const res = await req.get("/api/brands").query({ brand });

    const responseData = res.body.data.every((d) =>
      d.name_brand.includes(brand)
    );
    expect(res.status).toBe(200);
    expect(responseData).toBe(true);
    expect(res.body).toMatchObject({
      ...success("Berhasil mengambil kategori"),
    });
  });
});

describe("post brand", () => {
  test.todo("testing nya dilakukan manual menggunakan postman");
});
