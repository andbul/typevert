import { Constructor, Converter } from "./converter";
import { MappingRule } from "./decorators";

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
    SourceFieldType extends IN[SourceField],
    TargetFieldType extends OUT[TargetField]
>(
    sourceType: Constructor<IN>,
    targetType: Constructor<OUT>,
    mappings: MappingRule<SourceField, TargetField, SourceFieldType, TargetFieldType>[],
    options?: {}
) {
    return (sourceObject: IN) => mapObject(sourceObject, new targetType(), mappings);
}

// TODO Move to another file
function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key]; // Inferred type is T[K]
}

// TODO Move to another file
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
    obj[key] = value;
}

/**
 * Generated mapping function
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
    SourceFieldType extends IN[SourceField],
    TargetFieldType extends OUT[TargetField]
>(
    sourceObject: IN,
    targetObject: OUT,
    mappings: MappingRule<SourceField, TargetField, SourceFieldType, TargetFieldType>[],
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
        } else if (fieldValue) {
            setProperty(targetObject, targetField, convert(fieldValue));
        }
    });

    return targetObject;
}

/**
 * Describes order of converting.
 * Current realisation is: expr => converter.convert
 * @param expr - expression that will be evaluated
 * @param Converter - converter constructor
 */
function getOrderedConversion<SourceField, TargetField, SourceFieldType, TargetFieldType>(
    rule: MappingRule<SourceField, TargetField, SourceFieldType, TargetFieldType>
) {
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
