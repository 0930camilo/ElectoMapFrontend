import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, PLATFORM_ID, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiErrorService } from './core/services/api-error.service';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { AuditEntry, Page } from './shared/interface/api.models';
import { ProfileUpdateRequest } from './module/auth/model/auth.model';
import { AuthApiService } from './module/auth/services/auth-api.service';
import { CabeceraService } from './module/cabeceras/services/cabecera.service';
import { DashboardService } from './module/dashboard/services/dashboard.service';
import { DashboardSummary } from './module/dashboard/model/dashboard.model';
import { Cabecera } from './module/cabeceras/model/cabecera.model';
import { ImportacionService } from './module/importaciones/services/importacion.service';
import { AuditoriaService } from './module/auditoria/services/auditoria.service';
import { LiderService } from './module/lideres/services/lider.service';
import { Leader } from './module/lideres/model/leader.model';
import { AssignmentHistory, OcrCensoResult, Voter } from './module/votantes/model/voter.model';
import { ImportValidation } from './module/importaciones/model/import.model';
import { VotanteService } from './module/votantes/services/votante.service';

type Section = 'dashboard' | 'cabeceras' | 'lideres' | 'votantes' | 'importaciones' | 'auditoria';
type Entity = 'cabecera' | 'lider' | 'votante';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authApi = inject(AuthApiService);
  private readonly cabeceraApi = inject(CabeceraService);
  private readonly dashboardApi = inject(DashboardService);
  private readonly importApi = inject(ImportacionService);
  private readonly auditApi = inject(AuditoriaService);
  private readonly liderApi = inject(LiderService);
  private readonly votanteApi = inject(VotanteService);
  private readonly apiErrors = inject(ApiErrorService);
  readonly auth = inject(AuthService);
  readonly loading = inject(LoadingService).isLoading;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private loadedDashboardFor: number | null = null;

  username = '';
  password = '';
  showPassword = false;
  section: Section = 'dashboard';
  error = '';
  notice = '';
  modal: Entity | null = null;
  profileModalOpen = false;
  profileError = '';
  profileForm: ProfileUpdateRequest = this.emptyProfileForm();
  editingId: number | null = null;
  form: Record<string, string> = {};
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  dashboard: DashboardSummary | null = null;
  cabeceras: Cabecera[] = [];
  cabeceraOptions: Cabecera[] = [];
  lideres: Leader[] = [];
  leaderOptions: Leader[] = [];
  votantes: Voter[] = [];
  auditoriaRows: AuditEntry[] = [];
  cabeceraFilters: Record<string, string> = {};
  voterFilters: Record<string, string> = {};
  auditFilters: Record<string, string> = {};
  selectedFile: File | null = null;
  importLeaderId = '';
  importResult: ImportValidation | null = null;
  selectedVoter: Voter | null = null;
  voterHistory: AssignmentHistory[] | null = null;
  ocrImage: File | null = null;
  ocrResult: OcrCensoResult | null = null;
  ocrError = '';
  detailTitle = '';
  detailRecord: Record<string, string> | null = null;
  voterLookupDocument = '';
  profile: Leader | null = null;
  readonly voterStates = ['INTERESADO', 'PENDIENTE', 'CONFIRMADO', 'NO_INTERESADO', 'NO_CONTACTADO'];
  readonly documentTypes = ['CC', 'TI', 'CE', 'PASAPORTE', 'PEP', 'PPT', 'OTRO'];

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (!user) {
        this.loadedDashboardFor = null;
      } else if (this.loadedDashboardFor !== user.id) {
        this.loadedDashboardFor = user.id;
        void this.loadSection('dashboard');
      }
    });
  }
  private async loadSelectionOptions(): Promise<void> {
    [this.cabeceraOptions, this.leaderOptions] = await Promise.all([
      this.loadAllCabeceras(),
      this.loadAllLideres(),
    ]);
  }
  private async loadAllCabeceras(): Promise<Cabecera[]> {
    const first = await firstValueFrom(this.cabeceraApi.list(0, 100));
    const items = [...(first.content ?? [])];
    for (let index = 1; index < (first.totalPages ?? 1); index++) {
      const next = await firstValueFrom(this.cabeceraApi.list(index, 100));
      items.push(...(next.content ?? []));
    }
    return items;
  }
  private async loadAllLideres(): Promise<Leader[]> {
    const first = await firstValueFrom(this.liderApi.list(0, 100));
    const items = [...(first.content ?? [])];
    for (let index = 1; index < (first.totalPages ?? 1); index++) {
      const next = await firstValueFrom(this.liderApi.list(index, 100));
      items.push(...(next.content ?? []));
    }
    return items;
  }

  get isAdmin(): boolean { return this.auth.user()?.rol === 'ADMIN'; }
  get isLeader(): boolean { return this.auth.user()?.rol === 'LIDER'; }
  get activeLeaderOptions(): Leader[] {
    return this.leaderOptions.filter(leader => leader.estado === 'ACTIVO');
  }
  get displayName(): string { return this.auth.user()?.username ?? ''; }
  get sectionTitle(): string {
    return ({
      dashboard: 'Resumen general', cabeceras: 'Cabeceras',
      lideres: this.isLeader ? 'Mi perfil' : 'Líderes', votantes: 'Votantes',
      importaciones: 'Importar votantes', auditoria: 'Auditoría',
    } satisfies Record<Section, string>)[this.section];
  }

  async login(): Promise<void> {
    this.error = '';
    this.notice = '';
    if (!this.username.trim() || !this.password) {
      this.error = 'Ingresa tu usuario y contraseña.';
      return;
    }
    await this.run(async () => {
      const result = await firstValueFrom(this.authApi.login(this.username.trim(), this.password));
      this.auth.saveSession(result);
      this.password = '';
      this.section = 'dashboard';
    });
  }

  async openProfileEditor(): Promise<void> {
    this.clearMessage();
    this.profileError = '';
    const user = this.auth.user();
    if (!user) return;

    this.profileForm = { ...this.emptyProfileForm(), username: user.username };
    this.profileModalOpen = true;
    if (user.rol === 'LIDER') {
      await this.run(async () => {
        const leader = await firstValueFrom(this.liderApi.getCurrent());
        this.profileForm = {
          ...this.profileForm,
          nombres: leader.nombres,
          apellidos: leader.apellidos,
          username: leader.username,
          email: leader.email ?? '',
          telefono: leader.telefono ?? '',
        };
      });
      this.profileError = this.error;
    }
  }

  closeProfileEditor(): void {
    this.profileModalOpen = false;
    this.profileError = '';
    this.profileForm = this.emptyProfileForm();
  }

  async saveProfile(): Promise<void> {
    const form = this.profileForm;
    this.profileError = '';
    const credentialChanged = !!form.nuevaClave || form.username.trim() !== this.auth.user()?.username;
    const username = form.username.trim();
    await this.run(async () => {
      const result = await firstValueFrom(this.authApi.updateProfile({
        ...form,
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        username,
        email: form.email?.trim() || null,
        telefono: this.isLeader ? form.telefono?.trim() || null : null,
        nuevaClave: form.nuevaClave || null,
      }));
      this.closeProfileEditor();
      if (credentialChanged) {
        this.auth.clearSession();
        this.username = result.username;
        this.password = '';
        this.notice = 'Perfil actualizado. Inicia sesión nuevamente con tus nuevas credenciales.';
      } else {
        this.notice = 'Tu perfil se actualizó correctamente.';
      }
    });
    this.profileError = this.error;
  }

  logout(): void {
    this.auth.clearSession();
    this.clearMessage();
    this.section = 'dashboard';
    this.dashboard = null;
    this.profile = null;
    this.cabeceras = [];
    this.lideres = [];
    this.votantes = [];
  }

  dismissFeedback(): void {
    this.error = '';
    this.notice = '';
  }

  async navigate(section: Section): Promise<void> {
    if (!this.allowed(section)) return;
    this.section = section;
    this.page = 0;
    this.clearMessage();
    await this.loadSection(section);
  }

  async loadSection(section = this.section): Promise<void> {
    if (!this.auth.user()) return;
    await this.run(async () => {
      switch (section) {
        case 'dashboard':
          this.dashboard = await firstValueFrom(this.dashboardApi.getSummary(this.isAdmin ? 'ADMIN' : 'LIDER'));
          if (this.isLeader) this.profile = await firstValueFrom(this.liderApi.getCurrent());
          break;
        case 'cabeceras': await this.loadCabeceras(); break;
        case 'lideres':
          if (this.isLeader) this.profile = await firstValueFrom(this.liderApi.getCurrent());
          else await this.loadLideres();
          break;
        case 'votantes': await this.loadVotantes(); break;
        case 'auditoria': await this.loadAuditoria(); break;
        case 'importaciones':
          await this.loadSelectionOptions();
          break;
      }
    });
  }

  async changePage(delta: number): Promise<void> {
    const next = this.page + delta;
    if (next < 0 || next >= this.totalPages) return;
    this.page = next;
    await this.loadSection(this.section);
  }

  async changeSize(value: string): Promise<void> {
    this.size = Math.min(100, Math.max(1, Number(value) || 10));
    this.page = 0;
    await this.loadSection(this.section);
  }

  async applyVoterFilters(): Promise<void> {
    this.page = 0;
    await this.loadVotantes();
  }

  async applyCabeceraFilters(): Promise<void> {
    this.page = 0;
    await this.loadCabeceras();
  }

  async applyAuditFilters(): Promise<void> {
    this.page = 0;
    await this.loadAuditoria();
  }

  clearVoterFilters(): void {
    this.voterFilters = {};
    this.page = 0;
    void this.loadVotantes();
  }

  clearCabeceraFilters(): void {
    this.cabeceraFilters = {};
    this.page = 0;
    void this.loadCabeceras();
  }

  clearAuditFilters(): void {
    this.auditFilters = {};
    this.page = 0;
    void this.loadAuditoria();
  }

  openCreate(entity: Entity): void {
    this.modal = entity;
    this.editingId = null;
    this.form = this.initialForm(entity);
    if (entity === 'votante') this.resetOcr();
    this.clearMessage();
    if (entity === 'lider') void this.run(async () => {
      this.cabeceraOptions = await this.loadAllCabeceras();
    });
    if (entity === 'votante' && this.isAdmin) void this.run(async () => {
      this.leaderOptions = await this.loadAllLideres();
    });
  }

  openEdit(entity: Entity, value: Cabecera | Leader | Voter): void {
    this.modal = entity;
    this.editingId = value.id;
    if (entity === 'cabecera') {
      const row = value as Cabecera;
      this.form = { nombre: row.nombre, descripcion: row.descripcion ?? '', zona: row.zona ?? '' };
    } else if (entity === 'lider') {
      const row = value as Leader;
      this.form = {
        nombres: row.nombres, apellidos: row.apellidos, documento: row.documento,
        telefono: row.telefono ?? '', email: row.email ?? '', nuevaClave: '',
        cabeceraId: String(row.cabeceraId),
      };
      void this.run(async () => {
        this.cabeceraOptions = await this.loadAllCabeceras();
      });
    } else if (entity === 'votante') {
      const row = value as Voter;
      this.resetOcr();
      this.form = {
        tipoDocumento: row.tipoDocumento, numeroDocumento: row.numeroDocumento,
        nombres: row.nombres, apellidos: row.apellidos, telefono: row.telefono ?? '',
        departamentoVotacion: row.departamentoVotacion ?? '',
        municipioVotacion: row.municipioVotacion ?? '',
        puestoVotacion: row.puestoVotacion ?? '',
        direccion: row.direccion ?? '', barrio: row.barrio ?? '',
        mesaVotacion: row.mesaVotacion, estado: row.estado, observaciones: row.observaciones ?? '',
      };
    }
  }

  closeModal(): void {
    this.modal = null;
    this.editingId = null;
    this.resetOcr();
  }

  selectOcrImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const image = input.files?.[0] ?? null;
    this.ocrError = '';
    this.ocrResult = null;
    if (!image) {
      this.ocrImage = null;
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(image.type)) {
      this.ocrImage = null;
      input.value = '';
      this.ocrError = 'Selecciona una imagen PNG o JPEG.';
      return;
    }
    if (image.size > 5 * 1024 * 1024) {
      this.ocrImage = null;
      input.value = '';
      this.ocrError = 'La imagen no puede superar los 5 MB.';
      return;
    }
    this.ocrImage = image;
  }

  async recognizeCensusImage(): Promise<void> {
    if (!this.ocrImage) {
      this.ocrError = 'Selecciona primero una captura PNG o JPEG.';
      return;
    }
    this.ocrError = '';
    await this.run(async () => {
      this.ocrResult = await firstValueFrom(this.votanteApi.recognizeCensus(this.ocrImage!));
      this.form = {
        ...this.form,
        numeroDocumento: this.ocrResult.numeroDocumento || this.form['numeroDocumento'],
        departamentoVotacion: this.ocrResult.departamentoVotacion || this.form['departamentoVotacion'],
        municipioVotacion: this.ocrResult.municipioVotacion || this.form['municipioVotacion'],
        puestoVotacion: this.ocrResult.puestoVotacion || this.form['puestoVotacion'],
        direccion: this.ocrResult.direccion || this.form['direccion'],
        mesaVotacion: this.ocrResult.mesaVotacion || this.form['mesaVotacion'],
      };
    });
    this.ocrError = this.error;
    this.error = '';
  }

  private resetOcr(): void {
    this.ocrImage = null;
    this.ocrResult = null;
    this.ocrError = '';
  }

  async saveEntity(): Promise<void> {
    if (!this.modal) return;
    this.clearMessage();
    const entity = this.modal;
    const id = this.editingId ?? undefined;
    const value = { ...this.form };
    if (entity === 'lider' && !id && value['password'].length < 12) {
      this.error = 'La contraseña debe tener entre 12 y 72 caracteres.';
      return;
    }
    if (entity === 'lider' && id && value['nuevaClave'] && (value['nuevaClave'].length < 12 || value['nuevaClave'].length > 72)) {
      this.error = 'La nueva contraseña debe tener entre 12 y 72 caracteres.';
      return;
    }
    await this.run(async () => {
      switch (entity) {
        case 'cabecera':
          await firstValueFrom(this.cabeceraApi.save(value, id));
          await this.loadCabeceras();
          break;
        case 'lider': {
          const body = id
            ? {
                nombres: value['nombres'],
                apellidos: value['apellidos'],
                documento: value['documento'],
                telefono: value['telefono'],
                email: value['email'],
                ...(value['nuevaClave'] ? { nuevaClave: value['nuevaClave'] } : {}),
                cabeceraId: Number(value['cabeceraId']),
              }
            : { ...value, cabeceraId: Number(value['cabeceraId']) };
          await firstValueFrom(this.liderApi.save(body, id));
          await this.loadLideres();
          break;
        }
        case 'votante':
          if (!id && this.isAdmin) {
            const { liderDocumento, ...votante } = value;
            await firstValueFrom(this.votanteApi.saveForLeader(liderDocumento, votante));
          } else {
            await firstValueFrom(this.votanteApi.save(value, id));
          }
          await this.loadVotantes();
          break;
      }
      this.modal = null;
      this.notice = id ? 'Cambios guardados correctamente.' : 'Registro creado correctamente.';
    });
  }

  async toggleCabecera(row: Cabecera): Promise<void> {
    await this.run(async () => {
      await firstValueFrom(this.cabeceraApi.setState(row.id, row.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA'));
      await this.loadCabeceras();
      this.notice = 'Estado actualizado.';
    });
  }

  async showCabecera(row: Cabecera): Promise<void> {
    await this.run(async () => {
      const item = await firstValueFrom(this.cabeceraApi.get(row.id));
      this.detailTitle = item.nombre;
      this.detailRecord = {
        ID: String(item.id), Nombre: item.nombre, Descripción: item.descripcion || '—',
        Zona: item.zona || '—', Estado: item.estado,
        Administrador: item.administradorUsername || '—',
        Líderes: String(item.lideresAsignados ?? 0), Votantes: String(item.cantidadVotantes ?? 0),
      };
    });
  }

  async toggleLeader(row: Leader): Promise<void> {
    await this.run(async () => {
      await firstValueFrom(this.liderApi.setState(row.id, row.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'));
      await this.loadLideres();
      this.notice = 'Estado actualizado.';
    });
  }

  async showLeader(row: Leader): Promise<void> {
    await this.run(async () => {
      const item = await firstValueFrom(this.liderApi.get(row.id));
      this.detailTitle = `${item.nombres} ${item.apellidos}`;
      this.detailRecord = {
        ID: String(item.id), Usuario: item.username, Documento: item.documento,
        Teléfono: item.telefono || '—', Email: item.email || '—',
        Cabecera: item.cabeceraNombre || '—', Estado: item.estado,
      };
    });
  }

  async setVoterState(row: Voter, estado: string): Promise<void> {
    await this.run(async () => {
      await firstValueFrom(this.votanteApi.setState(row.id, estado));
      await this.loadVotantes();
      this.notice = 'Estado del votante actualizado.';
    });
  }

  async showVoter(row: Voter): Promise<void> {
    await this.run(async () => {
      this.selectedVoter = await firstValueFrom(this.votanteApi.get(row.id));
      this.voterHistory = null;
      this.modal = null;
    });
  }

  async lookupVoter(): Promise<void> {
    if (!this.voterLookupDocument.trim()) return;
    await this.run(async () => {
      this.selectedVoter = await firstValueFrom(this.votanteApi.getByDocument(this.voterLookupDocument.trim()));
      this.voterHistory = null;
    });
  }

  async loadHistory(row: Voter): Promise<void> {
    await this.run(async () => {
      this.selectedVoter = row;
      this.voterHistory = await firstValueFrom(this.votanteApi.getAssignmentHistory(row.id));
    });
  }

  async assignLeader(row: Voter): Promise<void> {
    const documento = window.prompt('Documento de identidad del líder al que se asignará este votante:')?.trim();
    if (!documento) return;
    const motivo = window.prompt('Motivo de la reasignación:')?.trim() ?? '';
    if (!motivo) {
      this.error = 'Debes indicar el motivo de la reasignación.';
      return;
    }
    await this.run(async () => {
      await firstValueFrom(this.votanteApi.assignLeader(row.id, documento, motivo));
      await this.loadVotantes();
      this.notice = 'Votante reasignado correctamente.';
    });
  }

  async deleteVoter(row: Voter): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !window.confirm(`¿Eliminar lógicamente a ${row.nombres} ${row.apellidos}?`)) return;
    await this.run(async () => {
      await firstValueFrom(this.votanteApi.delete(row.id));
      await this.loadVotantes();
      this.notice = 'Votante eliminado de las consultas normales.';
    });
  }

  selectFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile = file;
    this.importResult = null;
    this.error = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.selectedFile = null;
      this.error = 'El archivo supera el máximo permitido de 5 MB.';
    } else if (!/\.(csv|xlsx)$/i.test(file.name)) {
      this.selectedFile = null;
      this.error = 'Selecciona un archivo CSV o XLSX.';
    }
  }

  async validateImport(): Promise<void> {
    if (!this.selectedFile) { this.error = 'Selecciona primero un archivo CSV o XLSX.'; return; }
    await this.run(async () => {
      this.importResult = await firstValueFrom(this.importApi.validate(this.selectedFile!));
    });
  }

  async executeImport(): Promise<void> {
    if (!this.selectedFile || !this.importLeaderId) {
      this.error = 'Selecciona el archivo y el líder responsable.';
      return;
    }
    await this.run(async () => {
      this.importResult = await firstValueFrom(this.importApi.execute(this.selectedFile!, Number(this.importLeaderId)));
      this.notice = 'Importación procesada.';
      await this.loadVotantes();
    });
  }

  async downloadErrorReport(): Promise<void> {
    if (!this.selectedFile || !this.importResult || !isPlatformBrowser(this.platformId)) {
      this.error = 'Valida el archivo antes de descargar el reporte de errores.';
      return;
    }
    await this.run(async () => {
      const blob = await firstValueFrom(this.importApi.downloadErrorReport(this.selectedFile!));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'errores-importacion.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  getValue(row: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) if (row[key] !== undefined && row[key] !== null) return String(row[key]);
    return '';
  }

  private async loadCabeceras(): Promise<void> {
    const result = await firstValueFrom(this.cabeceraApi.list(
      this.page,
      this.size,
      this.cleanFilters(this.cabeceraFilters),
    ));
    this.setPage(result);
    this.cabeceras = result.content ?? [];
  }
  private async loadLideres(): Promise<void> {
    const result = await firstValueFrom(this.liderApi.list(this.page, this.size));
    this.setPage(result);
    this.lideres = result.content ?? [];
  }
  private async loadVotantes(): Promise<void> {
    const result = await firstValueFrom(this.votanteApi.list(this.page, this.size, this.cleanFilters(this.voterFilters)));
    this.setPage(result);
    this.votantes = result.content ?? [];
  }
  private async loadAuditoria(): Promise<void> {
    const result = await firstValueFrom(this.auditApi.list(this.page, this.size, this.cleanFilters(this.auditFilters)));
    this.setPage(result);
    this.auditoriaRows = result.content ?? [];
  }
  private setPage<T>(result: Page<T>): void {
    this.page = result.page ?? 0;
    this.size = result.size ?? this.size;
    this.totalPages = result.totalPages ?? 0;
    this.totalElements = result.totalElements ?? 0;
  }
  private cleanFilters(filters: Record<string, string>): Record<string, string> {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value.trim()));
  }
  private initialForm(entity: Entity): Record<string, string> {
    switch (entity) {
      case 'cabecera': return { nombre: '', descripcion: '', zona: '' };
      case 'lider': return { nombres: '', apellidos: '', documento: '', telefono: '', email: '', username: '', password: '', cabeceraId: '' };
      case 'votante': return { tipoDocumento: 'CC', numeroDocumento: '', nombres: '', apellidos: '', telefono: '', departamentoVotacion: '', municipioVotacion: '', puestoVotacion: '', direccion: '', barrio: '', mesaVotacion: '', estado: 'PENDIENTE', observaciones: '', ...(this.isAdmin ? { liderDocumento: '' } : {}) };
    }
  }
  private emptyProfileForm(): ProfileUpdateRequest {
    return {
      nombres: '',
      apellidos: '',
      username: '',
      email: '',
      telefono: '',
      nuevaClave: '',
    };
  }
  private allowed(section: Section): boolean {
    return this.isAdmin || (this.isLeader && ['dashboard', 'lideres', 'votantes'].includes(section));
  }
  private clearMessage(): void { this.error = ''; this.notice = ''; }
  private async run(operation: () => Promise<void>): Promise<void> {
    this.error = '';
    try {
      await operation();
    } catch (cause) {
      this.error = this.errorMessage(cause);
    } finally {
      this.cdr.markForCheck();
    }
  }
  private errorMessage(cause: unknown): string {
    return this.apiErrors.message(cause);
  }
}
