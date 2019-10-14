/* tslint:disable */
import { Mapper, Converter, MappingRule } from "../../src/typevert";
import { expect } from "chai";
import { generateConverter, generateConverterConstructor } from "./testutils";

export function suit() {
    it("should map field by default value", () => {
        // Setup
        class A {
            a_field: string;
        }
        class B {
            b_field: Number;
        }

        const a = new A();
        const converter = generateConverter(A, B, [
            {
                source: "a_field",
                target: "b_field",
                default: 1,
                expr: (x: string) => {
                    throw new Error("Failed");
                },
            },
        ]);

        // Test
        const result = converter.convert(new A());

        // Assert
        expect(result)
            .to.have.property("b_field")
            .that.equals(1);
    });

    it("should map field by expr", () => {
        // Setup
        class A {
            a_field: string = "foo";
        }
        class B {
            b_field: string;
        }

        const a = new A();
        const converter = generateConverter(A, B, [
            { source: "a_field", target: "b_field", default: "FAILED", expr: (x: string) => x.toUpperCase() },
        ]);

        // Test
        const result = converter.convert(new A());

        // Assert
        expect(result)
            .to.have.property("b_field")
            .that.equals("FOO");
    });

    it("should map field by converter", () => {
        // Setup
        class C {
            c_field: string = "expected";
        }
        class ConvertedC {
            c_internal_field: number;
        }
        class A {
            a_field: C = new C();
        }
        class B {
            b_field: ConvertedC;
        }

        const a = new A();
        const internalConverter = generateConverterConstructor(C, ConvertedC, [
            { source: "c_field", target: "c_internal_field", default: 1 },
        ]);
        const converter = generateConverter(A, B, [
            { source: "a_field", target: "b_field", converter: internalConverter },
        ]);

        // Test
        const result = converter.convert(new A());

        // Assert
        expect(result)
            .to.have.property("b_field")
            .that.is.instanceof(ConvertedC);
        expect(result.b_field)
            .to.have.property("c_internal_field")
            .that.equals("expected");
    });
}
