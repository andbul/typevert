/* tslint:disable */
import { Mapper, Converter, MappingRule } from "../../src/typevert";
import { expect } from "chai";
import { generateConverter } from "./testutils";

export function suit() {
    it("should ignore null object", () => {
        // Setup
        class A {}
        class B {}
        const converter = generateConverter(A, B, []);

        // Test
        const expected = new B();
        const result = converter.convert(null);

        // Assert
        expect(result).is.equal(null);
    });

    it("should map empty class to empty class", () => {
        // Setup
        class A {}
        class B {}
        const converter = generateConverter(A, B, []);

        // Test
        const expected = new B();
        const result = converter.convert(new A());

        // Assert
        expect(result).is.deep.equals(expected);
    });

    it("should map class with predifined fields to class with predifined fields", () => {
        // Setup
        class A {
            a = "123";
        }
        class B {
            b = "123";
        }
        const converter = generateConverter(A, B, []);

        // Test
        const expected = new B();
        const result = converter.convert(new A());

        // Assert
        expect(result).is.deep.equals(expected);
    });

    it("should ignore null fields", () => {
        // Setup
        class A {
            num_a: Number = null;
        }
        class B {
            num_b: Number;
        }
        const a = new A();
        const converter = generateConverter(A, B, [{ source: "num_a", target: "num_b" }]);

        // Test
        const result = converter.convert(new A());

        // Assert
        expect(result).does.not.have.property("num_b");
    });

    it("should map fields to one to one", () => {
        // Setup
        class A {
            num_a: Number = 1;
            str_a: string = "foo";
            arr_a: Number[] = [1, 2, 3];
            obj_a: {} = { foo: "foo_value" };
        }
        class B {
            num_b: Number;
            str_b: string;
            arr_b: [];
            obj_b: {};
        }
        const a = new A();
        const converter = generateConverter(A, B, [
            { source: "num_a", target: "num_b" },
            { source: "str_a", target: "str_b" },
            { source: "arr_a", target: "arr_b" },
            { source: "obj_a", target: "obj_b" },
        ]);

        // Test
        const result = converter.convert(new A());

        // Assert
        expect(result)
            .to.have.property("num_b")
            .that.equals(1);
        expect(result)
            .to.have.property("str_b")
            .that.equals("foo");
        expect(result)
            .to.have.property("arr_b")
            .that.deep.equals([1, 2, 3]);
        expect(result)
            .to.have.property("obj_b")
            .that.deep.equals({ foo: "foo_value" });
    });
}
