import { Constructor } from "./utils";
import { getProperty, setProperty } from "./utils";
import { MappingRule } from "./api";
/**
 * Generates mapping function which will be called during runtime
 * @param sourceType - source type constructor
 * @param targetType - target type constructor
 * @param mappings - mappings array
 * @param options - additional mapping options
 */
export function generateMappingFunction<
    IN,
    OUT,
    SourceField extends keyof IN,
    TargetField extends keyof OUT,
    Midle,
    SourceFieldType extends IN[SourceField],
    TargetFieldType extends OUT[TargetField]
>(
    sourceType: Constructor<IN>,
    targetType: Constructor<OUT>,
    mappings: MappingRule<SourceField, TargetField, SourceFieldType, Midle, TargetFieldType>[],
    options?: {}
) {
    return (sourceObject: IN) => mapObject(sourceObject, new targetType(), mappings);
}

/**
 * Generated mapping function
 *
 * @param sourceObject - object that contains values
 * @param targetObject - object that will be filled according mapping
 * @param mappings - from => to mapping declaration with meta information
 * @param enableNullCheck - enable null check when source object is null
 */
export function mapObject<
    IN,
    OUT,
    SourceField extends keyof IN,
    TargetField extends keyof OUT,
    Midle,
    SourceFieldType extends IN[SourceField],
    TargetFieldType extends OUT[TargetField]
>(
    sourceObject: IN,
    targetObject: OUT,
    mappings: MappingRule<SourceField, TargetField, SourceFieldType, Midle, TargetFieldType>[],
    enableNullCheck: boolean = true
) {
    if (enableNullCheck && sourceObject == null) {
        return null;
    }

    mappings.forEach(mapping => {
        // Get values
        const targetField = mapping.target;
        const sourceField = mapping.source;
        const defaultValue = mapping.default;
        // TODO Typeguards or go js
        const fieldValue = getProperty(sourceObject, sourceField) as SourceFieldType;
        const convert = getOrderedConversion(mapping);

        // Map object//
        if (!fieldValue && defaultValue) {
            setProperty(targetObject, targetField, defaultValue);
        } else if (fieldValue && mapping.isCollection && fieldValue instanceof Array) {
            // TODO Typeguards or go js
            const converted = (convertCollection(fieldValue, convert) as unknown) as TargetFieldType;
            setProperty(targetObject, targetField, converted);
        } else {
            setProperty(targetObject, targetField, convert(fieldValue));
        }
    });

    return targetObject;
}

/**
 * Describes order of converting.
 *
 * @param expr - expression that will be evaluated
 * @param Converter - converter constructor
 */
function getOrderedConversion<SourceField, TargetField, SourceFieldType, Midle, TargetFieldType>(
    rule: MappingRule<SourceField, TargetField, SourceFieldType, Midle, TargetFieldType>
) {
    if ("converter" in rule && "expr" in rule) {
        const converter = new rule.converter();
        return (s: SourceFieldType) => converter.convert(rule.expr(s));
    }

    if ("converter" in rule) {
        const converter = new rule.converter();
        return (s: SourceFieldType) => converter.convert(s);
    }

    if ("expr" in rule) {
        return (s: SourceFieldType) => rule.expr(s);
    }

    return (s: SourceFieldType) => (s as unknown) as TargetFieldType;
}

/**
 * Converts collection with Array.map function
 * @param collection - collection to convert
 * @param mapper - mapping function
 */
function convertCollection<S, T>(collection: S[], mapper: (s: S) => T): T[] {
    return collection.map(o => mapper(o));
}
