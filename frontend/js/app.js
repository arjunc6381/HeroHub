(function () {
    'use strict';

    var API = window.HEROHUB_API;
    var app = document.getElementById('app');
    var flashBox = document.getElementById('flash');
    var departments = [];
    var pendingFlash = null;

    var BADGE = {
        ENGINEERING: 'dept-engineering', HUMAN_RESOURCES: 'dept-hr', FINANCE: 'dept-finance',
        MARKETING: 'dept-marketing', OPERATIONS: 'dept-operations', SALES: 'dept-sales'
    };

    /* ---------- helpers ---------- */

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function money(n) { return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
    function fmtDate(iso, long) {
        return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB',
            { day: '2-digit', month: long ? 'long' : 'short', year: 'numeric' });
    }
    function deptLabel(code) {
        var d = departments.filter(function (x) { return x.code === code; })[0];
        return d ? d.label : code;
    }
    function badge(code) {
        return '<span class="badge hh-badge ' + (BADGE[code] || '') + '">' + esc(deptLabel(code)) + '</span>';
    }
    function setActive(name) {
        document.querySelectorAll('[data-nav]').forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('data-nav') === name);
        });
    }
    function showFlash(msg) {
        flashBox.innerHTML = '<div class="alert alert-success alert-dismissible fade show hh-alert" role="alert">' +
            '<i class="bi bi-check-circle-fill me-2"></i>' + esc(msg) +
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        setTimeout(function () { flashBox.innerHTML = ''; }, 5000);
    }
    function errorBox(msg) {
        return '<div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>' + esc(msg) + '</div>';
    }

    function api(path, options) {
        options = options || {};
        if (options.body) { options.headers = { 'Content-Type': 'application/json' }; }
        return fetch(API + path, options).then(function (res) {
            if (res.status === 204) { return null; }
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) { var err = new Error(data.message || 'Request failed'); err.status = res.status; err.data = data; throw err; }
                return data;
            });
        });
    }

    function fail(err) {
        if (err.status === 404) {
            app.innerHTML = '<div class="text-center py-5"><div class="hh-error-code">404</div>' +
                '<h1 class="h3">We couldn\'t find that employee</h1>' +
                '<a class="btn btn-hero mt-3" href="#/employees">Back to directory</a></div>';
        } else if (err.status) {
            app.innerHTML = errorBox(err.message);
        } else {
            app.innerHTML = errorBox('Cannot reach the HeroHub backend at ' + API +
                '. Start it with "mvn spring-boot:run" inside the backend folder.');
        }
    }

    /* ---------- views ---------- */

    function dashboard() {
        setActive('dashboard');
        return api('/dashboard').then(function (s) {
            var rows = s.departmentBreakdown.map(function (d) {
                var pct = s.totalEmployees ? Math.round(d.count * 100 / s.totalEmployees) : 0;
                return '<div class="mb-3"><div class="d-flex justify-content-between small mb-1">' +
                    '<span class="fw-semibold">' + esc(d.label) + '</span>' +
                    '<span class="text-muted">' + d.count + (d.count === 1 ? ' employee' : ' employees') + '</span></div>' +
                    '<div class="progress hh-progress"><div class="progress-bar ' + (BADGE[d.code] || '') +
                    '" style="width:' + pct + '%"></div></div></div>';
            }).join('') || '<p class="text-muted mb-0">No employees yet.</p>';

            var recent = s.recentHires.map(function (e) {
                return '<li class="hh-recent"><a href="#/employees/' + esc(e.employeeId) + '" class="d-flex align-items-center gap-3 text-decoration-none">' +
                    '<span class="hh-avatar">' + esc(e.initials) + '</span>' +
                    '<span class="flex-grow-1"><span class="d-block fw-semibold text-dark">' + esc(e.fullName) + '</span>' +
                    '<span class="d-block small text-muted">' + esc(e.designation) + '</span></span>' +
                    '<span class="small text-muted">' + fmtDate(e.joiningDate) + '</span></a></li>';
            }).join('');

            app.innerHTML =
                '<section class="hh-hero mb-4"><div><span class="hh-eyebrow">Employee Self-Service Portal</span>' +
                '<h1>Welcome to HeroHub</h1><p>One place for employee records, search, profiles and workforce metrics.</p></div>' +
                '<div class="d-flex gap-2 flex-wrap"><a class="btn btn-hero btn-lg" href="#/employees"><i class="bi bi-people me-2"></i>Open directory</a>' +
                '<a class="btn btn-outline-light btn-lg" href="#/employees/new"><i class="bi bi-person-plus me-2"></i>Add employee</a></div></section>' +
                '<section class="row g-3 mb-4">' +
                stat('bi-people-fill', '', s.totalEmployees, 'Total staff') +
                stat('bi-building', 'alt', s.totalDepartments, 'Departments') +
                stat('bi-currency-rupee', 'green', money(s.averageSalary), 'Average salary / year') +
                '</section><section class="row g-3">' +
                '<div class="col-12 col-lg-6"><div class="hh-card h-100"><h2 class="hh-card-title">Department breakdown</h2>' + rows + '</div></div>' +
                '<div class="col-12 col-lg-6"><div class="hh-card h-100"><h2 class="hh-card-title">Recent joiners</h2><ul class="list-unstyled mb-0">' + recent + '</ul></div></div></section>';
        });
    }

    function stat(icon, cls, value, label) {
        return '<div class="col-12 col-md-4"><div class="hh-stat"><div class="hh-stat-icon ' + cls + '"><i class="bi ' + icon + '"></i></div>' +
            '<div><div class="hh-stat-value">' + esc(value) + '</div><div class="hh-stat-label">' + esc(label) + '</div></div></div></div>';
    }

    function directory(params) {
        setActive('directory');
        var q = params.get('q') || '';
        var dept = params.get('department') || '';
        var qs = new URLSearchParams();
        if (q) { qs.set('q', q); }
        if (dept) { qs.set('department', dept); }

        return Promise.all([api('/employees?' + qs.toString()), api('/employees')]).then(function (res) {
            var list = res[0], total = res[1].length;
            var options = departments.map(function (d) {
                return '<option value="' + d.code + '"' + (d.code === dept ? ' selected' : '') + '>' + esc(d.label) + '</option>';
            }).join('');
            var rows = list.map(function (e) {
                return '<tr><td><a href="#/employees/' + esc(e.employeeId) + '" class="d-flex align-items-center gap-3 text-decoration-none">' +
                    '<span class="hh-avatar">' + esc(e.initials) + '</span><span><span class="d-block fw-semibold text-dark">' + esc(e.fullName) +
                    '</span><span class="d-block small text-muted">' + esc(e.email) + '</span></span></a></td>' +
                    '<td><code>' + esc(e.employeeId) + '</code></td><td>' + badge(e.department) + '</td><td>' + esc(e.designation) + '</td>' +
                    '<td class="text-end">' + money(e.salary) + '</td><td class="text-end text-nowrap">' +
                    '<a class="btn btn-sm btn-outline-secondary" href="#/employees/' + esc(e.employeeId) + '" title="View"><i class="bi bi-eye"></i></a> ' +
                    '<a class="btn btn-sm btn-outline-primary" href="#/employees/' + esc(e.employeeId) + '/edit" title="Edit"><i class="bi bi-pencil"></i></a> ' +
                    '<button type="button" class="btn btn-sm btn-outline-danger js-delete" title="Delete" data-id="' + esc(e.employeeId) +
                    '" data-name="' + esc(e.fullName) + '"><i class="bi bi-trash"></i></button></td></tr>';
            }).join('') || '<tr><td colspan="6" class="text-center text-muted py-5"><i class="bi bi-search fs-2 d-block mb-2"></i>No employees match your search.</td></tr>';

            app.innerHTML =
                '<div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3"><div><h1 class="hh-page-title">Employee directory</h1>' +
                '<p class="text-muted mb-0">Showing <strong>' + list.length + '</strong> of <strong>' + total + '</strong> employees</p></div>' +
                '<a class="btn btn-hero" href="#/employees/new"><i class="bi bi-person-plus me-1"></i>Add employee</a></div>' +
                '<form class="hh-card hh-filter mb-3" id="filterForm"><div class="row g-2 align-items-end">' +
                '<div class="col-12 col-md-6"><label for="q" class="form-label small fw-semibold">Search</label><div class="input-group">' +
                '<span class="input-group-text"><i class="bi bi-search"></i></span><input id="q" type="text" class="form-control" value="' + esc(q) +
                '" placeholder="Employee ID, name, department or designation"></div></div>' +
                '<div class="col-8 col-md-4"><label for="department" class="form-label small fw-semibold">Department</label>' +
                '<select id="department" class="form-select"><option value="">All departments</option>' + options + '</select></div>' +
                '<div class="col-4 col-md-2 d-flex gap-2"><button type="submit" class="btn btn-hero flex-grow-1">Filter</button>' +
                '<a class="btn btn-outline-secondary" href="#/employees" title="Clear filters"><i class="bi bi-x-lg"></i></a></div></div></form>' +
                '<div class="hh-card p-0 overflow-hidden"><div class="table-responsive"><table class="table hh-table align-middle mb-0"><thead><tr>' +
                '<th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th class="text-end">Salary</th><th class="text-end">Actions</th></tr></thead><tbody>' +
                rows + '</tbody></table></div></div>';

            document.getElementById('filterForm').addEventListener('submit', function (ev) {
                ev.preventDefault();
                var p = new URLSearchParams();
                var qv = document.getElementById('q').value.trim();
                var dv = document.getElementById('department').value;
                if (qv) { p.set('q', qv); }
                if (dv) { p.set('department', dv); }
                var s = p.toString();
                location.hash = '#/employees' + (s ? '?' + s : '');
            });
            document.querySelectorAll('.js-delete').forEach(function (btn) {
                btn.addEventListener('click', function () { askDelete(btn.dataset.id, btn.dataset.name); });
            });
        });
    }

    function askDelete(id, name) {
        document.getElementById('deleteName').textContent = name;
        var modalEl = document.getElementById('deleteModal');
        var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        var confirmBtn = document.getElementById('deleteConfirm');
        confirmBtn.onclick = function () {
            api('/employees/' + encodeURIComponent(id), { method: 'DELETE' }).then(function () {
                modal.hide();
                pendingFlash = name + ' was removed from the directory.';
                if (location.hash === '#/employees') { route(); } else { location.hash = '#/employees'; }
            }).catch(function (err) { modal.hide(); fail(err); });
        };
        modal.show();
    }

    function profile(id) {
        setActive('directory');
        return api('/employees/' + encodeURIComponent(id)).then(function (e) {
            app.innerHTML =
                '<nav aria-label="breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="#/employees">Directory</a></li>' +
                '<li class="breadcrumb-item active" aria-current="page">' + esc(e.fullName) + '</li></ol></nav>' +
                '<div class="row g-3"><div class="col-12 col-lg-4"><div class="hh-card text-center">' +
                '<span class="hh-avatar hh-avatar-lg mx-auto">' + esc(e.initials) + '</span>' +
                '<h1 class="h4 mt-3 mb-1">' + esc(e.fullName) + '</h1><p class="text-muted mb-2">' + esc(e.designation) + '</p>' + badge(e.department) +
                '<hr><div class="d-grid gap-2"><a class="btn btn-hero" href="#/employees/' + esc(e.employeeId) + '/edit"><i class="bi bi-pencil me-1"></i>Edit profile</a>' +
                '<a class="btn btn-outline-secondary" href="#/employees"><i class="bi bi-arrow-left me-1"></i>Back to directory</a></div></div></div>' +
                '<div class="col-12 col-lg-8"><div class="hh-card"><h2 class="hh-card-title">Employee details</h2><dl class="row hh-dl mb-0">' +
                dl('Employee ID', '<code>' + esc(e.employeeId) + '</code>') +
                dl('Email', '<a href="mailto:' + esc(e.email) + '">' + esc(e.email) + '</a>') +
                dl('Phone', esc(e.phone)) + dl('Department', esc(deptLabel(e.department))) +
                dl('Designation', esc(e.designation)) + dl('Annual salary', money(e.salary)) +
                dl('Joined', fmtDate(e.joiningDate, true)) + '</dl></div></div></div>';
        });
    }
    function dl(term, html) { return '<dt class="col-sm-4">' + term + '</dt><dd class="col-sm-8">' + html + '</dd>'; }

    function field(id, label, type, value, extra) {
        return '<div class="col-md-6"><label for="' + id + '" class="form-label">' + label + '</label>' +
            '<input id="' + id + '" name="' + id + '" type="' + type + '" class="form-control" value="' + esc(value) + '" ' + (extra || '') + ' required>' +
            '<div class="invalid-feedback" data-error-for="' + id + '">Please check this field</div></div>';
    }

    function form(id) {
        var edit = !!id;
        setActive(edit ? 'directory' : 'add');
        var load = edit ? api('/employees/' + encodeURIComponent(id)) : Promise.resolve({});
        return load.then(function (e) {
            var opts = '<option value="">Select department</option>' + departments.map(function (d) {
                return '<option value="' + d.code + '"' + (d.code === e.department ? ' selected' : '') + '>' + esc(d.label) + '</option>';
            }).join('');
            app.innerHTML =
                '<div class="row justify-content-center"><div class="col-12 col-lg-9 col-xl-8">' +
                '<nav aria-label="breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="#/employees">Directory</a></li>' +
                '<li class="breadcrumb-item active">' + (edit ? 'Edit' : 'Add') + '</li></ol></nav>' +
                '<h1 class="hh-page-title mb-1">' + (edit ? 'Edit employee' : 'Add a new employee') + '</h1>' +
                '<p class="text-muted">' + (edit ? 'Editing <strong>' + esc(id) + '</strong>' : 'An Employee ID is generated automatically when you save.') + '</p>' +
                '<form class="hh-card" id="empForm" novalidate><div id="formAlert"></div>' +
                '<h2 class="hh-section">Personal details</h2><div class="row g-3 mb-4">' +
                field('firstName', 'First name', 'text', e.firstName, 'minlength="2" maxlength="50"') +
                field('lastName', 'Last name', 'text', e.lastName, 'maxlength="50"') +
                field('email', 'Email', 'email', e.email) +
                field('phone', 'Phone', 'tel', e.phone, 'pattern="[0-9+\\-\\s]{10,15}"') + '</div>' +
                '<h2 class="hh-section">Job details</h2><div class="row g-3 mb-4">' +
                '<div class="col-md-6"><label for="department" class="form-label">Department</label>' +
                '<select id="department" name="department" class="form-select" required>' + opts + '</select>' +
                '<div class="invalid-feedback" data-error-for="department">Select a department</div></div>' +
                field('designation', 'Designation', 'text', e.designation, 'maxlength="80"') +
                field('salary', 'Annual salary (₹)', 'number', e.salary, 'min="1" step="0.01"') +
                field('joiningDate', 'Joining date', 'date', e.joiningDate, 'max="' + new Date().toISOString().slice(0, 10) + '"') + '</div>' +
                '<div class="d-flex justify-content-end gap-2"><a class="btn btn-outline-secondary" href="' + (edit ? '#/employees/' + esc(id) : '#/employees') + '">Cancel</a>' +
                '<button type="submit" class="btn btn-hero"><i class="bi bi-check2-circle me-1"></i>' + (edit ? 'Save changes' : 'Add employee') + '</button></div>' +
                '</form></div></div>';

            var f = document.getElementById('empForm');
            f.addEventListener('submit', function (ev) {
                ev.preventDefault();
                clearErrors(f);
                f.classList.add('was-validated');
                if (!f.checkValidity()) { return; }
                var body = {};
                ['firstName', 'lastName', 'email', 'phone', 'department', 'designation', 'salary', 'joiningDate'].forEach(function (k) {
                    body[k] = f.elements[k].value.trim();
                });
                body.salary = Number(body.salary);
                api(edit ? '/employees/' + encodeURIComponent(id) : '/employees',
                    { method: edit ? 'PUT' : 'POST', body: JSON.stringify(body) })
                    .then(function (saved) {
                        pendingFlash = edit ? saved.fullName + "'s details were updated."
                            : saved.fullName + ' was added as ' + saved.employeeId + '.';
                        location.hash = '#/employees/' + saved.employeeId;
                    })
                    .catch(function (err) {
                        if (err.data && err.data.errors && Object.keys(err.data.errors).length) {
                            f.classList.remove('was-validated');
                            Object.keys(err.data.errors).forEach(function (name) {
                                var input = f.elements[name];
                                var msg = f.querySelector('[data-error-for="' + name + '"]');
                                if (input) { input.classList.add('is-invalid'); }
                                if (msg) { msg.textContent = err.data.errors[name]; }
                            });
                            document.getElementById('formAlert').innerHTML = errorBox('Please fix the highlighted fields.');
                        } else {
                            document.getElementById('formAlert').innerHTML = errorBox(err.status ? err.message :
                                'Cannot reach the backend. Is it running?');
                        }
                    });
            });
        });
    }
    function clearErrors(f) {
        f.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
        document.getElementById('formAlert').innerHTML = '';
    }

    function about() {
        setActive('about');
        function layer(icon, title, text) {
            return '<div class="col-12 col-md-6 col-lg-3"><div class="hh-card h-100"><div class="hh-layer"><i class="bi ' + icon + '"></i></div>' +
                '<h2 class="h6">' + title + '</h2><p class="small text-muted mb-0">' + text + '</p></div></div>';
        }
        app.innerHTML = '<h1 class="hh-page-title">Architecture &amp; OOP model</h1><p class="text-muted">How HeroHub is organised.</p>' +
            '<div class="row g-3 mb-4">' +
            layer('bi-window', 'Frontend', 'HTML5, CSS3, JavaScript and Bootstrap 5 call the REST API with fetch().') +
            layer('bi-signpost-split', 'Controller', 'Spring MVC REST endpoints under /api.') +
            layer('bi-gear', 'Service', 'Validation rules, ID generation, search and dashboard metrics.') +
            layer('bi-database', 'Repository + DB', 'Spring Data JPA over an SQL database (schema in /database).') + '</div>' +
            '<div class="row g-3"><div class="col-12 col-md-6"><div class="hh-card h-100"><h2 class="hh-card-title">Encapsulation</h2>' +
            '<p class="mb-0"><code>Person</code> keeps its fields private and exposes them through getters and setters.</p></div></div>' +
            '<div class="col-12 col-md-6"><div class="hh-card h-100"><h2 class="hh-card-title">Inheritance</h2>' +
            '<p class="mb-0"><code>Employee extends Person</code>, reusing name, email and phone, and adding Employee ID, department, designation, salary and joining date.</p></div></div></div>';
        return Promise.resolve();
    }

    /* ---------- router ---------- */

    function route() {
        var hash = location.hash || '#/';
        var parts = hash.slice(1).split('?');
        var path = parts[0].replace(/\/+$/, '') || '/';
        var params = new URLSearchParams(parts[1] || '');
        var m;
        var view;

        if (path === '/') { view = dashboard(); }
        else if (path === '/employees') { view = directory(params); }
        else if (path === '/employees/new') { view = form(null); }
        else if ((m = path.match(/^\/employees\/([^/]+)\/edit$/))) { view = form(decodeURIComponent(m[1])); }
        else if ((m = path.match(/^\/employees\/([^/]+)$/))) { view = profile(decodeURIComponent(m[1])); }
        else if (path === '/about') { view = about(); }
        else { view = Promise.reject({ status: 404 }); }

        view.then(function () {
            if (pendingFlash) { showFlash(pendingFlash); pendingFlash = null; }
            window.scrollTo(0, 0);
        }).catch(fail);
    }

    document.getElementById('navSearch').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var v = document.getElementById('navSearchInput').value.trim();
        location.hash = '#/employees' + (v ? '?q=' + encodeURIComponent(v) : '');
        document.getElementById('navSearchInput').value = '';
    });
    window.addEventListener('hashchange', route);

    api('/departments').then(function (d) { departments = d; }).catch(function () { }).then(route);
})();
