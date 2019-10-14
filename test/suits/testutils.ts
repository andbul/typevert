/* tslint:disable */
import { Mapper, Converter, MappingRule } from "../../src/typevert";

export type Constructor<T> = new (...args: any[]) => T;

export function generateConverter<
    IN,
    OUT,
    SourceField extends keyof IN,
    TargetField extends keyof OUT,
    SourceFieldType extends IN[SourceField],
    TargetFieldType extends OUT[TargetField]
>(
    source: Constructor<IN>,
    target: Constructor<OUT>,
    mapping: MappingRule<SourceField, TargetField, SourceFieldType, TargetFieldType>[]
) {
    @Mapper({ sourceType: source, targetType: target }, mapping)
    class GeneratedConverter extends Converter<IN, OUT> {}
    return new GeneratedConverter();
}

export function generateConverterConstructor<
    IN,
    OUT,
    SourceField extends keyof IN,
    TargetField extends keyof OUT,
    SourceFieldType extends IN[SourceField],
    TargetFieldType extends OUT[TargetField]
>(
    source: Constructor<IN>,
    target: Constructor<OUT>,
    mapping: MappingRule<SourceField, TargetField, SourceFieldType, TargetFieldType>[]
) {
    @Mapper({ sourceType: source, targetType: target }, mapping)
    class GeneratedConverter extends Converter<IN, OUT> {}
    return GeneratedConverter;
}
