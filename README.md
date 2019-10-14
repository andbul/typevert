# Typevert

[![Build Status](https://travis-ci.org/andbul/typevert.svg?branch=master)](https://travis-ci.org/andbul/typevert)
[![Coverage Status](https://coveralls.io/repos/github/andbul/typevert/badge.svg?branch=master)](https://coveralls.io/github/andbul/typevert?branch=master)

Define Object to Object mapping using Typescript decorators

## Basic usage

```typescript
import { Mapper, Converter } from "./typevert";

class A {
    aField: string = "common_field";
    aCollection: Number[] = [1, 2, 3, 4];
}

class B {
    bField: string;
    bCollection: Number[];
}

@Mapper({ sourceType: A, targetType: B }, [
    { source: "aField", target: "bField" },
    { source: "aCollection", target: "bCollection", isCollection: true },
])
class AToBMapper extends Converter<A, B> {}

const a = new A();
const aToBConverter = new AToBMapper();
const resultB = aToBConverter.convert(a);
```

## Motivation

A common problem when converting classes one to another is that you have to write a lot of boilerplate mapping functions
or converters. For example mapping Mongo Entities to your internal objects could produce a significant number of nested
mappings, null checks, etc.

Typevert aims to solve this problem.

Instead of:

```typescript
class DocumentEntity {
    name: string;
    payload: string;
}

class UserEntity {
    id: string;
    roles: string[];
    documents: DocumentEntity[];
}

class Document {
    name: string;
    format: string;
    payload: string;
}

class User {
    id: string;
    roles: string[];
    documents: DocumentEntity[];
}

function mapUserEntityToUser(userEntity: UserEntity) {
    if (userEntity == null) {
        return null;
    }
    const user = new User();
    user.id = userEntity.id;
    user.roles = userEntity.roles == null ? null : userEntity.roles.map(role => role.toUpperCase());
    user.documents = user.documents == null ? null : userEntity.documents.map(doc => mapDocuments(doc));
    return user;
}

function mapDocuments(documentEntity: DocumentEntity) {
    if (documentEntity == null) {
        return null;
    }
    const document = new Document();
    document.name = documentEntity.name;
    document.format = documentEntity.name == null ? null : documentEntity.name.split(".")[1];
    document.payload = documentEntity.payload;
    return document;
}
```

You can just write:

```typescript
@Mapper({ sourceType: DocumentEntity, targetType: Document }, [
    { source: "name", target: "name" },
    { source: "format", target: "name", expr: name => name.split(".")[1] },
    { source: "payload", target: "payload" },
])
class DocumentMapper extends Converter<DocumentEntity, Document> {}

@Mapper({ sourceType: DocumentEntity, targetType: Document }, [
    { source: "id", target: "id" },
    { source: "roles", target: "roles", isCollection: true, expr: role => role.toUpperCase() },
    { source: "documents", target: "documents", isCollection: true, converter: DocumentMapper },
])
class UserMapper extends Converter<DocumentEntity, Document> {}
```

## Requirements

-   TypeScript 3.2+
-   Node 8+
-   `emitDecoratorMetadata` and `experimentalDecorators` must be enabled in `tsconfig.json`

## Install

`npm install typevert -S`

## Documentation

### Mapper decorator

The @Mapper decorator adds the target class the mappingFunction method. It admits converting your source object to
target according to the mappings.

Mapper decorator checks that your class is a child of the Converter<IN, OUT> abstract class.

Decorator accepts two arguments:

-   MapperDeclaration - which contains mapper description: name, source type and target type

    ```typescript
    export interface MapperDeclaration<IN, OUT> {
        name?: string; // Name of the mapper
        sourceType: Constructor<IN>; // Constructor of the source type
        targetType: Constructor<OUT>; // Constructor of the target type
    }
    ```

-   Mappings - array of rules how to convert one field to another

    ```typescript
    export class MappingRules<SourceField, TargetField, SourceFieldType, TargetFieldType> {
        source!: SourceField; // String Field name from the source object which would be mapped
        target!: TargetField; // String Field name from the target object where to map
        default?: TargetFieldType; // Default value if source field is null
        isCollection?: Boolean = false; // Flag that enables Array.map converting for this field
        expr?: (x: SourceFieldType) => TargetFieldType; // Expression for manual converting or preparing field
        converter?: Constructor<Converter<SourceFieldType, TargetFieldType>>; // Converter constructor for nested objects
    }
    ```

    Options in mapping rules have order when `expr` and `converter` are present :

    1. Exec converting by `expr`
    2. Exec converting by `converter.convert`

    Additionally:

    -   If source field is null then default value will be set and none `expr` or `converter` called
    -   If isCollection then for each object in collection mapping will be performed
    -   If none `expr` or `converter` is set and field value is not null then common assigment is performing
