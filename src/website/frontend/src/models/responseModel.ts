export default interface ResponseModel<T> {
    success: boolean;
    data: T;
}