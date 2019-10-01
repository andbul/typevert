import { Mapper, Converter, MappingRules } from "../../src/typevert"

export type Constructor<T> = new (...args: any[]) => T;
export function generateConverter<IN, OUT>(source: Constructor<IN>, target: Constructor<OUT>, mapping: MappingRules[]) {
    @Mapper({ sourceType: source, targetType: target }, mapping)
    class GeneratedConverter extends Converter<IN, OUT> { }
    return new GeneratedConverter()
}

export function generateConverterConstructor<IN, OUT>(source: Constructor<IN>, target: Constructor<OUT>, mapping: MappingRules[]) {
    @Mapper({ sourceType: source, targetType: target }, mapping)
    class GeneratedConverter extends Converter<IN, OUT> { }
    return GeneratedConverter
}