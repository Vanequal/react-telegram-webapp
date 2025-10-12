export class ErrorHandler {
    static handle(error, context = '') {
      console.error(`[${context}] Error:`, error);
      
      if (error.response) {
        // Server responded with error
        return {
          message: error.response.data?.message || 'Произошла ошибка на сервере',
          code: error.response.status
        };
      } else if (error.request) {
        // Request was made but no response
        return {
          message: 'Нет ответа от сервера',
          code: 'NETWORK_ERROR'
        };
      } else {
        // Something else happened
        return {
          message: error.message || 'Произошла неизвестная ошибка',
          code: 'UNKNOWN_ERROR'
        };
      }
    }
    
    static getErrorMessage(error) {
      if (typeof error === 'string') return error;
      if (error.message) return error.message;
      if (error.error) return error.error;
      return 'Произошла ошибка';
    }
  }