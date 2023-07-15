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
      createMany: jest.fn().mockImplementation((args) => {
        console.log(args);
        return true;
      }),
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
    modelItems = [
      {
        id_brand: "12342134",
        id_category: "1341234",
        name: "sepatu adidas",
        price: 100000,
        stock: 4,
        rating: 4.5,
      },
      {
        id_brand: "123434534",
        id_category: "13234534",
        name: "celana gucci",
        price: 400000,
        stock: 5,
        rating: 4.2,
      },
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

describe("Routes items sudah di test manual menggunakan postman. Test todo pada describe ini merupakan testing yang sudah dilakukan", () => {
  test("should get all items", async () => {});
  test.todo("should get item based on name");
  test.todo("should get item based on name and brand");
  test.todo("should get item based on name, brand, and category");
  test.todo("should get item based on name, brand, category, and limit prize");
});

// describe("create items", () => {
//   test("should create item", async () => {
//     const res = await req
//       .post("/api/items")
//       .set("Cookie", loginCookieAdmin)
//       .send([
//         {
//           id_brand: "",
//           id_category: "",
//           name: "",
//           price: "",
//           stock: "",
//           rating: "",
//         },
//       ]);
//     console.log(res.body);
//   });
// });
