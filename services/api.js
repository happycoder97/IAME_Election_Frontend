class RequiresLoginError { }

export default class {
  constructor(http, debug = false) {
    this.http = http
    this.debug = debug
    if (this.isLoggedIn) {
      this.http.setToken('Bearer ' + this.loginToken)
    } else {
      this.http.setToken(false)
    }
  }

  get isLoggedIn() {
    return this.loginToken !== null
  }

  get loginToken() {
    return window.localStorage.getItem('loginToken')
  }

  _setLoggedIn(token) {
    window.localStorage.setItem('loginToken', token)
    this.http.setToken('Bearer ' + token)
  }

  _setLoggedOut() {
    window.localStorage.removeItem('loginToken')
    this.http.setToken(false)
  }

  _log(msg) {
    if (this.debug && window.console) {
      window.console.log('[api.js]: ' + msg)
    }
  }

  async _parseResp(resp) {
    if (!resp.ok && resp.status === 401) {
      this._setLoggedOut()
      throw new RequiresLoginError()
    }
    if (!resp.ok) {
      const text = await resp.text()
      console.log(text)
      return false
    }
    const json = await resp.json()
    if (!json.success) {
      this._log(json.message)
    }
    return json
  }

  async _get(url) {
    const resp = await this.http.get(url, { throwHttpErrors: false })
    return this._parseResp(resp)
  }
  async _post(url, data = {}) {
    const resp = await this.http.post(url, data, { throwHttpErrors: false })
    return this._parseResp(resp)
  }
  async _put(url, data = {}) {
    const resp = await this.http.put(url, data, { throwHttpErrors: false })
    return this._parseResp(resp)
  }
  async _delete(url, data = {}) {
    const resp = await this.http.delete(url, data, { throwHttpErrors: false })
    return this._parseResp(resp)
  }

  /**
     * Signup as a new user
     * @param {name, email, password} user
     */

  async signup(user) {
    const json = await this._post('api/signup', user)
    return json
  }

  /**
   * @param {email, password} creds
   */
  async login(creds) {
    const json = await this._post('api/login', creds)
    if (json.success) {
      const token = json.data
      this._setLoggedIn(token)
    }
    return json
  }

  logout() {
    this._setLoggedOut()
  }

  async profile() {
    const json = await this._get('api/profile')
    return json
  }

  /**
   * @param {name, boys, girls} klass
   */
  async addClass(klass) {
    klass.boys = Number(klass.boys)
    klass.girls = Number(klass.girls)
    const json = await this._post('api/classes', klass, { throwHttpErrors: false })
    return json
  }

  /**
   * @returns [{id, school_id, name, boys, girls}]
   */
  async getClasses() {
    const json = await this._get('api/classes')
    return json
  }

  /**
   * @param {name, boys, girls} klass
   */
  async updateClass(id, klass) {
    klass.boys = Number(klass.boys)
    klass.girls = Number(klass.girls)
    const json = await this._put('api/classes/' + id, klass)
    return json
  }

  async deleteClass(id) {
    const json = await this._delete('api/classes/' + id)
    return json
  }

  /* -------------------------------------------------------------------- */

  /**
   */
  async addElection(election) {
    election.presidential = Boolean(election.presidential)
    election.genders = Number(election.genders)
    const json = await this._post('api/elections', election, { throwHttpErrors: false })
    return json
  }

  /**
   */
  async getElections() {
    const json = await this._get('api/elections')
    return json
  }

  /**
   */
  async updateElection(id, election) {
    election.presidential = election.presidential === 'true' || election.presidential === true
    election.genders = Number(election.genders)
    const json = await this._put('api/elections/' + id, election)
    return json
  }

  async deleteElection(id) {
    const json = await this._delete('api/elections/' + id)
    return json
  }
}
