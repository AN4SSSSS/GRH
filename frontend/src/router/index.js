import { createRouter, createWebHistory } from 'vue-router'
import { store } from '../store.js'
import { nomRouteParDefaut } from '../roles.js'
import MainLayout from '../layouts/MainLayout.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import DemandeView from '../views/DemandeView.vue'
import MesDemandesView from '../views/MesDemandesView.vue'
import ProfilView from '../views/ProfilView.vue'
import CalendrierView from '../views/CalendrierView.vue'
import ValidationsView from '../views/ValidationsView.vue'
import SoldesEquipeView from '../views/SoldesEquipeView.vue'
import RhDashboardView from '../views/RhDashboardView.vue'
import RhEmployesView from '../views/RhEmployesView.vue'
import RhParametrageView from '../views/RhParametrageView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import AdminUtilisateursView from '../views/AdminUtilisateursView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { roles: ['employe'] },
      },
      {
        path: 'demande',
        name: 'demande',
        component: DemandeView,
        meta: { roles: ['employe'] },
      },
      {
        path: 'mes-demandes',
        name: 'mes-demandes',
        component: MesDemandesView,
        meta: { roles: ['employe'] },
      },
      {
        path: 'profil/:id',
        name: 'profil',
        component: ProfilView,
        meta: { roles: ['employe', 'manager', 'rh', 'admin'] },
      },
      {
        path: 'calendrier',
        name: 'calendrier',
        component: CalendrierView,
        meta: { roles: ['employe', 'manager', 'rh', 'admin'] },
      },
      {
        path: 'validations',
        name: 'validations',
        component: ValidationsView,
        meta: { roles: ['manager'] },
      },
      {
        path: 'soldes-equipe',
        name: 'soldes-equipe',
        component: SoldesEquipeView,
        meta: { roles: ['manager'] },
      },
      {
        path: 'rh/dashboard',
        name: 'rh-dashboard',
        component: RhDashboardView,
        meta: { roles: ['rh'] },
      },
      {
        path: 'rh/employes',
        name: 'rh-employes',
        component: RhEmployesView,
        meta: { roles: ['rh'] },
      },
      {
        path: 'rh/parametrage',
        name: 'rh-parametrage',
        component: RhParametrageView,
        meta: { roles: ['rh', 'admin'] },
      },
      {
        path: 'admin/dashboard',
        name: 'admin-dashboard',
        component: AdminDashboardView,
        meta: { roles: ['admin'] },
      },
      {
        path: 'admin/utilisateurs',
        name: 'admin-utilisateurs',
        component: AdminUtilisateursView,
        meta: { roles: ['admin'] },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.name !== 'login' && !store.token) {
    return { name: 'login' }
  }

  if (to.name === 'login' && store.token) {
    return { name: nomRouteParDefaut(store.user?.role) }
  }

  if (to.meta.roles && !to.meta.roles.includes(store.user?.role)) {
    return { name: nomRouteParDefaut(store.user?.role) }
  }
})

export default router
