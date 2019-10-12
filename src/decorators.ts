import { Constructor, Conversion, Converter } from "./converter";
import { generateMappingFunction } from "./mapping";
import { type } from "os";

/**
 * Mapping rules that will be used during mapping.
 *
 * source - name of the source object field
 * source - name of the target object field
 * default - set default value if field is null
 * expr - helps to pre evaluate field value
 * isCollection - transform field value with Array.map
 * converter - convert field value with converter
 *
 * Mapping has the next order:
 *  - Setup default in field if null
 *  - Evaluate expr
 *  - Evaluate converter
 *
 *  If isCollection is true then for each value in collection will be performed:
 *  - Evaluate expr
 *  - Evaluate converter
 */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export type ContainsExpression<SourceFieldType, TargetFieldType> = {
    expr: (x: SourceFieldType) => TargetFieldType;
};

export type ContainsConverter<SourceFieldType, TargetFieldType> = {
    converter: Constructor<Converter<SourceFieldType, TargetFieldType>>;
};

export type Rule<SourceField, TargetField, SourceFieldType, TargetFieldType> = {
    source: SourceField;
    target: TargetField;
    default?: TargetFieldType;
    isCollection?: boolean;
};

export type MappingRule<SourceField, TargetField, SourceFieldType, TargetFieldType> = XOR<
    Rule<SourceField, TargetField, SourceFieldType, TargetFieldType> &
        Partial<ContainsConverter<SourceFieldType, TargetFieldType>>,
    Rule<SourceField, TargetField, SourceFieldType, TargetFieldType> &
        Partial<ContainsExpression<SourceFieldType, TargetFieldType>>
>;

/**
 * Declaration that describes mapper with:
 *
 * name - name of the mapper
 * sourceType - constructor
 * targetType - will be used for creating new target object
 *
 */
export interface MapperDeclaration<IN, OUT> {
    name?: string;
    sourceType: Constructor<IN>;
    targetType: Constructor<OUT>;
}

/**
 * Mapper API. Decorator that used for describing mapper
 * @param mapperDeclaration - declaration
 * @param mappings - mappings
 * @constructor - generated mapper
 */
export function Mapper<
    IN,
    OUT,
    SourceField extends keyof IN,
    TargetField extends keyof OUT,
    SourceFieldType extends IN[SourceField],
    TargetFieldType extends OUT[TargetField]
>(
    mapperDeclaration: MapperDeclaration<IN, OUT>,
    mappings?: MappingRule<SourceField, TargetField, SourceFieldType, TargetFieldType>[]
) {
    return <T extends Constructor<Conversion<IN, OUT>>>(constructor: T) => {
        return class extends constructor {
            public mappings = mappings;
            public mappingFunction = generateMappingFunction(
                mapperDeclaration.sourceType,
                mapperDeclaration.targetType,
                mappings
            );
        };
    };
}
