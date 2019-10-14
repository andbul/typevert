/* tslint:disable */
import { Mapper, Converter } from "../../src";
import { expect } from "chai";

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
        @Mapper({ sourceType: A, targetType: B }, [
            {
                source: "a_field",
                target: "b_field",
                default: 1,
                expr: (x: string) => {
                    throw new Error("Failed");
                },
            },
        ])
        class GeneratedConverter extends Converter<A, B> {}
        const converter = new GeneratedConverter();

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

        @Mapper({ sourceType: A, targetType: B }, [
            { source: "a_field", target: "b_field", default: "FAILED", expr: (x: string) => x.toUpperCase() },
        ])
        class GeneratedConverter extends Converter<A, B> {}
        const converter = new GeneratedConverter();

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
            c_internal_field: string;
        }
        class A {
            a_field: C = new C();
        }
        class B {
            b_field: ConvertedC;
        }

        const a = new A();
        @Mapper({ sourceType: C, targetType: ConvertedC }, [{ source: "c_field", target: "c_internal_field" }])
        class InternalGeneratedConverter extends Converter<C, ConvertedC> {}

        @Mapper({ sourceType: A, targetType: B }, [
            { source: "a_field", target: "b_field", converter: InternalGeneratedConverter },
        ])
        class GeneratedConverter extends Converter<A, B> {}
        const converter = new GeneratedConverter();

        // Test
        const result = converter.convert(new A());

        // Assert
        expect(result)
            .to.have.property("b_field")
            .that.is.instanceof(ConvertedC);

        expect(result)
            .to.have.property("b_field")
            .that.has.property("c_internal_field")
            .that.is.a("string");

        expect(result.b_field)
            .to.have.property("c_internal_field")
            .that.equals("expected");
    });

    it("should map field by expression and then by converter", () => {
        // Setup
        class C {
            c_field: string = "expected";
        }
        class ConvertedC {
            c_internal_field: number;
        }
        class A {
            a_field: C = null;
        }
        class B {
            b_field: ConvertedC;
        }

        const a = new A();
        @Mapper({ sourceType: C, targetType: ConvertedC }, [{ source: "c_field", target: "c_internal_field" }])
        class InternalGeneratedConverter extends Converter<C, ConvertedC> {}

        @Mapper({ sourceType: A, targetType: B }, [
            { source: "a_field", target: "b_field", expr: s => new C(), converter: InternalGeneratedConverter },
        ])
        class GeneratedConverter extends Converter<A, B> {}
        const converter = new GeneratedConverter();

        // Test
        const result = converter.convert(new A());

        // Assert
        expect(result)
            .to.have.property("b_field")
            .that.is.instanceof(ConvertedC);

        expect(result)
            .to.have.property("b_field")
            .that.has.property("c_internal_field")
            .that.is.a("string");

        expect(result.b_field)
            .to.have.property("c_internal_field")
            .that.equals("expected");
    });

    it("should map field by expression and then by converter", () => {
        // Setup
        class C {
            c_field: string = "expected";
        }
        class ConvertedC {
            c_internal_field: number;
        }
        class A {
            a_field: C[] = [];
        }
        class B {
            b_field: ConvertedC[];
        }

        const a = new A();
        @Mapper({ sourceType: C, targetType: ConvertedC }, [
            {
                source: "c_field",
                target: "c_internal_field",
            },
        ])
        class InternalGeneratedConverter extends Converter<C, ConvertedC> {}

        @Mapper({ sourceType: A, targetType: B }, [
            { source: "a_field", target: "b_field", isCollection: true, converter: InternalGeneratedConverter },
        ])
        class GeneratedConverter extends Converter<A, B> {}
        const converter = new GeneratedConverter();

        // Test
        const result = converter.convert(new A());

        // Assert
        expect(result)
            .to.have.property("b_field")
            .to.be.an("array");
    });
}
