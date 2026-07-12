function nomRouteParDefaut(role) {
  if (role === 'manager') return 'validations'
  if (role === 'rh') return 'rh-dashboard'
  if (role === 'admin') return 'admin-dashboard'
  return 'dashboard'
}

export { nomRouteParDefaut }
