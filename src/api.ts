import { Conversion, Converter } from "./converter";
import { generateMappingFunction } from "./engine";
import { Constructor } from "./utils";

/**
 * Mapping rules that will be used during mapping.
 *
 * source - name of the source object field
 * source - name of the target object field
 * default - set default value if field is null
 * isCollection - transform field value with Array.map
 * expr - helps to  convert value instead implementing converter
 * converter - convert field value with converter
 *
 * Mapping has the next order:
 *  - Setup default in field if null
 *  - Executes expr then Executes converter
 *
 *  If isCollection is true then for each value in collection will be performed:
 *  - Executes expr then Executes converter
 */

export type Base<SourceField, TargetField, SourceFieldType, TargetFieldType> = {
    source: SourceField;
    target: TargetField;
    default?: TargetFieldType;
    isCollection?: boolean;
};

export type ContainsExpression<SourceFieldType, TargetFieldType> = {
    expr: (x: any) => any;
};

export type ContainsConverter<SourceFieldType, TargetFieldType> = {
    converter: Constructor<Converter<any, any>>;
};

// export type ExpressionType<SourceFieldType, TargetFieldType> =
//     SourceFieldType extends (infer Sv)[] ?
//     TargetFieldType extends (infer Tv)[] ?
//     ((x: SourceFieldType) => TargetFieldType) | ((x: Sv) => Tv)
//     : ((x: SourceFieldType) => TargetFieldType)
//     : ((x: SourceFieldType) => TargetFieldType)

// export type ConverterType<SourceFieldType, TargetFieldType> =
//     SourceFieldType extends (infer Sv)[] ?
//     TargetFieldType extends (infer Tv)[] ?
//     Converter<SourceFieldType, TargetFieldType> | Converter<Sv, Tv>
//     : Converter<SourceFieldType, TargetFieldType>
//     : Converter<SourceFieldType, TargetFieldType>

export type BaseWithExpression<SourceField, TargetField, SourceFieldType, TargetFieldType> = Base<
    SourceField,
    TargetField,
    SourceFieldType,
    TargetFieldType
> &
    ContainsExpression<SourceFieldType, TargetFieldType>;

export type BaseWithConverter<SourceField, TargetField, SourceFieldType, TargetFieldType> = Base<
    SourceField,
    TargetField,
    SourceFieldType,
    TargetFieldType
> &
    ContainsConverter<SourceFieldType, TargetFieldType>;

export type BaseWithBoth<SourceField, TargetField, SourceFieldType, MidleFieldType, TargetFieldType> = Base<
    SourceField,
    TargetField,
    SourceFieldType,
    TargetFieldType
> &
    ContainsExpression<SourceFieldType, MidleFieldType> &
    ContainsConverter<MidleFieldType, TargetFieldType>;

export type MappingRule<SourceField, TargetField, SourceFieldType, Midle, TargetFieldType> =
    | Base<SourceField, TargetField, SourceFieldType, TargetFieldType>
    | BaseWithExpression<SourceField, TargetField, SourceFieldType, TargetFieldType>
    | BaseWithConverter<SourceField, TargetField, SourceFieldType, TargetFieldType>
    | BaseWithBoth<SourceField, TargetField, SourceFieldType, Midle, TargetFieldType>;

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
    Midle,
    TargetFieldType extends OUT[TargetField]
>(
    mapperDeclaration: MapperDeclaration<IN, OUT>,
    mappings?: MappingRule<SourceField, TargetField, SourceFieldType, Midle, TargetFieldType>[]
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
