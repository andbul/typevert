/* tslint:disable */
import { expect } from "chai";
import { Converter, Mapper, MappingRules } from "../../src/typevert";
import { generateConverter } from "./testutils";

export function suit() {
    it("should map primitives in collections", () => {
        // Setup
        class A {
            a_number_collection: Number[] = [1, 2, 3];
            a_string_collection: string[] = ["1", "2", "3"];
            a_obj_collection: object[] = [{ foo: 1 }, { foo: 2 }];
        }
        class B {
            b_number_collection: Number[];
            b_string_collection: string[];
            b_obj_collection: object[];
        }
        const a = new A();
        const converter = generateConverter(A, B, [
            { source: "a_number_collection", target: "b_number_collection", isCollection: true },
            { source: "a_string_collection", target: "b_string_collection", isCollection: true },
            { source: "a_obj_collection", target: "b_obj_collection", isCollection: true },
        ]);

        // Test
        const result = converter.convert(new A());

        // Assert
        expect(result)
            .to.have.property("b_number_collection")
            .that.deep.equals([1, 2, 3]);
        expect(result)
            .to.have.property("b_string_collection")
            .that.deep.equals(["1", "2", "3"]);
        expect(result)
            .to.have.property("b_obj_collection")
            .that.deep.equals([{ foo: 1 }, { foo: 2 }]);
    });
}
