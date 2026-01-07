import Swal from 'sweetalert2'

// Custom SweetAlert2 configuration with better styling
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

export function useAlert() {
  // Success alert (toast)
  const showSuccess = (message, options = {}) => {
    return Toast.fire({
      icon: 'success',
      title: message,
      ...options
    })
  }

  // Error alert (toast)
  const showError = (message, options = {}) => {
    return Toast.fire({
      icon: 'error',
      title: message,
      timer: 5000,
      ...options
    })
  }

  // Warning alert (toast)
  const showWarning = (message, options = {}) => {
    return Toast.fire({
      icon: 'warning',
      title: message,
      timer: 4000,
      ...options
    })
  }

  // Info alert (toast)
  const showInfo = (message, options = {}) => {
    return Toast.fire({
      icon: 'info',
      title: message,
      ...options
    })
  }

  // Confirmation dialog
  const showConfirm = (options = {}) => {
    return Swal.fire({
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#02735E',
      cancelButtonColor: '#d33',
      confirmButtonText: options.confirmText || 'Yes',
      cancelButtonText: options.cancelText || 'Cancel',
      reverseButtons: true,
      ...options
    })
  }

  // Delete confirmation dialog
  const showDeleteConfirm = (options = {}) => {
    return Swal.fire({
      title: options.title || 'Are you sure?',
      text: options.text || 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: options.confirmText || 'Yes, delete it!',
      cancelButtonText: options.cancelText || 'Cancel',
      reverseButtons: true,
      ...options
    })
  }

  // Loading alert
  const showLoading = (message = 'Loading...') => {
    return Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  // Close any open alert
  const closeAlert = () => {
    Swal.close()
  }

  // Full screen success alert
  const showSuccessAlert = (title, text = '', options = {}) => {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      confirmButtonColor: '#02735E',
      ...options
    })
  }

  // Full screen error alert
  const showErrorAlert = (title, text = '', options = {}) => {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonColor: '#02735E',
      ...options
    })
  }

  // Input dialog
  const showInput = (options = {}) => {
    return Swal.fire({
      input: options.inputType || 'text',
      inputLabel: options.label || '',
      inputPlaceholder: options.placeholder || '',
      showCancelButton: true,
      confirmButtonColor: '#02735E',
      cancelButtonColor: '#6c757d',
      inputValidator: options.validator,
      ...options
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDeleteConfirm,
    showLoading,
    closeAlert,
    showSuccessAlert,
    showErrorAlert,
    showInput,
    Swal
  }
}

export default useAlert
