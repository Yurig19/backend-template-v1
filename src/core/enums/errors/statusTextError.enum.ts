export enum HttpStatusTextEnum {
  // Success responses
  OK = 'OK',
  CREATED = 'Created',
  ACCEPTED = 'Accepted',
  NO_CONTENT = 'No Content',

  // Redirection messages
  MOVED_PERMANENTLY = 'Moved Permanently',
  FOUND = 'Found',
  SEE_OTHER = 'See Other',
  NOT_MODIFIED = 'Not Modified',
  TEMPORARY_REDIRECT = 'Temporary Redirect',
  PERMANENT_REDIRECT = 'Permanent Redirect',

  // Client error responses
  BAD_REQUEST = 'Bad Request',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  NOT_FOUND = 'Not Found',
  METHOD_NOT_ALLOWED = 'Method Not Allowed',
  REQUEST_TIMEOUT = 'Request Timeout',
  CONFLICT = 'Conflict',
  PAYLOAD_TOO_LARGE = 'Payload Too Large',
  UNSUPPORTED_MEDIA_TYPE = 'Unsupported Media Type',
  UNPROCESSABLE_ENTITY = 'Unprocessable Entity',
  TOO_MANY_REQUESTS = 'Too Many Requests',

  // Server error responses
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
  NOT_IMPLEMENTED = 'Not Implemented',
  BAD_GATEWAY = 'Bad Gateway',
  SERVICE_UNAVAILABLE = 'Service Unavailable',
  GATEWAY_TIMEOUT = 'Gateway Timeout',
}
