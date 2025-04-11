export class SimpleResult {
    success: boolean
    errorMessage: string
    description: string

    constructor();

    constructor(
        success?: boolean,
        errorMessage?: string,
        description?: string,      
    ) {
        this.success = success
        this.errorMessage = errorMessage
        this.description = description      
    }

    errorResult(errorMessage:string):this{
        this.success=false;
        this.errorMessage=errorMessage;
        return this;
    }
}
export class Result<T> {
    success: boolean
    errorMessage: string
    description: string
    value: T

    constructor();

    constructor(
        success?: boolean,
        errorMessage?: string,
        description?: string,
        value?: T
    ) {
        this.success = success
        this.errorMessage = errorMessage
        this.description = description
        this.value = value
    }

    errorResult(errorMessage:string):this{
        this.success=false;
        this.errorMessage=errorMessage;
        return this;
    }
}

export class SocketResult<T> {
    DataType:string
    Success: boolean
    ErrorMessage: string
    Description: string
    Value: T

    constructor();

    constructor(
        success?: boolean,
        errorMessage?: string,
        description?: string,
        value?: T,
        dataType?:string
    ) {
        this.Success = success
        this.ErrorMessage = errorMessage
        this.Description = description
        this.Value = value
        this.DataType=dataType
    }

    errorResult(errorMessage:string):this{
        this.Success=false;
        this.ErrorMessage=errorMessage;
        return this;
    }
}