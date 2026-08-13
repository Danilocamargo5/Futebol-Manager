import 'package:flutter/material.dart';

import 'app_state.dart';
import 'models.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final state = AppState();
  await state.load();
  runApp(PeladaProApp(state: state));
}

class PeladaProApp extends StatelessWidget {
  const PeladaProApp({super.key, required this.state});

  final AppState state;

  @override
  Widget build(BuildContext context) {
    const navy = Color(0xFF14233B);
    return AnimatedBuilder(
      animation: state,
      builder: (context, child) {
        if (!state.isReady) {
          return const MaterialApp(
            home: Scaffold(body: Center(child: CircularProgressIndicator())),
          );
        }
        return MaterialApp(
          title: 'Pelada Pro',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            useMaterial3: true,
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF2457D6),
              brightness: Brightness.light,
            ),
            scaffoldBackgroundColor: const Color(0xFFF5F7FB),
            appBarTheme: const AppBarTheme(
              backgroundColor: Color(0xFFF5F7FB),
              foregroundColor: navy,
              elevation: 0,
              scrolledUnderElevation: 0,
            ),
            cardTheme: CardTheme(
              elevation: 0,
              color: Colors.white,
              margin: EdgeInsets.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(20)),
              ),
            ),
            inputDecorationTheme: InputDecorationTheme(
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.all(Radius.circular(14)),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.all(Radius.circular(14)),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.all(Radius.circular(14)),
                borderSide: BorderSide(color: Color(0xFF2457D6), width: 1.5),
              ),
            ),
          ),
          home: HomeShell(state: state),
        );
      },
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.state});

  final AppState state;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int currentIndex = 0;
  DrawResult? draw;

  @override
  Widget build(BuildContext context) {
    final screens = [
      DashboardScreen(state: widget.state, onOpenDraw: () => setState(() => currentIndex = 3)),
      PlayersScreen(state: widget.state),
      TeamsScreen(state: widget.state),
      DrawScreen(
        state: widget.state,
        draw: draw,
        onDraw: () => setState(() => draw = widget.state.drawTeams()),
      ),
      RankingsScreen(state: widget.state),
    ];
    return Scaffold(
      body: SafeArea(child: screens[currentIndex]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) => setState(() => currentIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.grid_view_rounded), label: 'Início'),
          NavigationDestination(icon: Icon(Icons.groups_rounded), label: 'Jogadores'),
          NavigationDestination(icon: Icon(Icons.shield_rounded), label: 'Times'),
          NavigationDestination(icon: Icon(Icons.shuffle_rounded), label: 'Sorteio'),
          NavigationDestination(icon: Icon(Icons.emoji_events_rounded), label: 'Rankings'),
        ],
      ),
    );
  }
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key, required this.state, required this.onOpenDraw});

  final AppState state;
  final VoidCallback onOpenDraw;

  @override
  Widget build(BuildContext context) {
    final topScorer = state.rankingByGoals().firstOrNull;
    final topKeeper = state.rankingByGoalkeeper().firstOrNull;
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
      children: [
        const Text(
          'Pelada Pro',
          style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: Color(0xFF14233B)),
        ),
        const SizedBox(height: 4),
        Text(
          'Sua pelada organizada, do sorteio ao ranking.',
          style: TextStyle(color: Colors.blueGrey.shade600, fontSize: 15),
        ),
        const SizedBox(height: 24),
        _HeroCard(onTap: onOpenDraw),
        const SizedBox(height: 22),
        Row(
          children: [
            Expanded(child: _MetricCard(label: 'Jogadores', value: '${state.players.length}', icon: Icons.groups_rounded)),
            const SizedBox(width: 12),
            Expanded(child: _MetricCard(label: 'Partidas', value: '${state.matches.length}', icon: Icons.sports_soccer_rounded)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _MetricCard(label: 'Times', value: '${state.teams.length}', icon: Icons.shield_rounded)),
            const SizedBox(width: 12),
            Expanded(child: _MetricCard(label: 'Presentes', value: '${state.players.where((p) => p.present).length}', icon: Icons.how_to_reg_rounded)),
          ],
        ),
        const SizedBox(height: 26),
        const _SectionTitle(title: 'Destaques atuais'),
        const SizedBox(height: 12),
          _HighlightCard(
          icon: Icons.sports_soccer_rounded,
          color: const Color(0xFFEF8B3B),
          title: 'Artilheiro',
          name: topScorer?.name ?? 'Ainda sem gols registrados',
          detail: topScorer == null ? 'Registre sua primeira partida' : '${state.goalsFor(topScorer.id)} gols no total',
        ),
        const SizedBox(height: 10),
          _HighlightCard(
          icon: Icons.back_hand_rounded,
          color: const Color(0xFF29A88A),
          title: 'Melhor goleiro',
          name: topKeeper?.name ?? 'Ainda sem prêmio registrado',
          detail: topKeeper == null ? 'Escolha o destaque ao salvar uma partida' : '${state.goalkeeperAwardsFor(topKeeper.id)} prêmio(s)',
        ),
      ],
    );
  }
}

class PlayersScreen extends StatefulWidget {
  const PlayersScreen({super.key, required this.state});

  final AppState state;

  @override
  State<PlayersScreen> createState() => _PlayersScreenState();
}

class _PlayersScreenState extends State<PlayersScreen> {
  String search = '';

  @override
  Widget build(BuildContext context) {
    final filtered = widget.state.players
        .where((player) => player.name.toLowerCase().contains(search.toLowerCase()))
        .toList();
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Jogadores', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            onPressed: () => showPlayerEditor(context, widget.state),
            icon: const Icon(Icons.person_add_alt_1_rounded),
            tooltip: 'Adicionar jogador',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
        children: [
          TextField(
            onChanged: (value) => setState(() => search = value),
            decoration: const InputDecoration(
              hintText: 'Buscar jogador',
              prefixIcon: Icon(Icons.search_rounded),
            ),
          ),
          const SizedBox(height: 18),
          Text('${filtered.length} jogador(es)', style: TextStyle(color: Colors.blueGrey.shade600)),
          const SizedBox(height: 10),
          for (final player in filtered)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: PlayerTile(
                player: player,
                state: widget.state,
                onTap: () => showPlayerEditor(context, widget.state, player: player),
              ),
            ),
          if (filtered.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 80),
              child: Center(child: Text('Nenhum jogador encontrado.')),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showPlayerEditor(context, widget.state),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Novo jogador'),
      ),
    );
  }
}

class TeamsScreen extends StatelessWidget {
  const TeamsScreen({super.key, required this.state});

  final AppState state;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Times', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            onPressed: () => showTeamEditor(context, state),
            icon: const Icon(Icons.add_rounded),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
        children: [
          Text('Organize seus grupos fixos', style: TextStyle(color: Colors.blueGrey.shade600)),
          const SizedBox(height: 16),
          for (final team in state.teams)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Card(
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                  leading: CircleAvatar(
                    backgroundColor: Color(team.colorValue).withOpacity(.12),
                    child: Icon(Icons.shield_rounded, color: Color(team.colorValue)),
                  ),
                  title: Text(team.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                  subtitle: Text('${state.players.where((player) => player.teamId == team.id).length} jogador(es)'),
                  trailing: PopupMenuButton<String>(
                    onSelected: (action) async {
                      if (action == 'edit') await showTeamEditor(context, state, team: team);
                      if (action == 'delete') await state.removeTeam(team);
                    },
                    itemBuilder: (context) => const [
                      PopupMenuItem(value: 'edit', child: Text('Editar')),
                      PopupMenuItem(value: 'delete', child: Text('Excluir')),
                    ],
                  ),
                ),
              ),
            ),
          if (state.teams.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 90),
              child: Center(child: Text('Cadastre o primeiro time.')),
            ),
        ],
      ),
    );
  }
}

class DrawScreen extends StatelessWidget {
  const DrawScreen({
    super.key,
    required this.state,
    required this.draw,
    required this.onDraw,
  });

  final AppState state;
  final DrawResult? draw;
  final VoidCallback onDraw;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Sorteio da pelada', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
        children: [
          Card(
            color: const Color(0xFF14233B),
            child: Padding(
              padding: const EdgeInsets.all(22),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Prontos para jogar?', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 6),
                  const Text('Monte dois times equilibrados com um toque.', style: TextStyle(color: Colors.white, fontSize: 21, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 18),
                  Text('${state.players.where((player) => player.present).length} jogadores marcados como presentes', style: const TextStyle(color: Colors.white70)),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: state.players.where((player) => player.present).length < 2 ? null : onDraw,
                      icon: const Icon(Icons.shuffle_rounded),
                      label: const Text('Sortear times'),
                      style: FilledButton.styleFrom(backgroundColor: const Color(0xFF5BE0B5), foregroundColor: const Color(0xFF14233B)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (draw != null) ...[
            const SizedBox(height: 22),
            Row(
              children: [
                Expanded(child: _TeamDrawCard(title: 'Time Azul', color: const Color(0xFF2457D6), players: draw!.teamA, rating: draw!.teamARating)),
                const SizedBox(width: 12),
                Expanded(child: _TeamDrawCard(title: 'Time Laranja', color: const Color(0xFFEF8B3B), players: draw!.teamB, rating: draw!.teamBRating)),
              ],
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: () => showMatchEditor(context, state, draw!),
              icon: const Icon(Icons.sports_score_rounded),
              label: const Text('Registrar resultado'),
            ),
          ],
          const SizedBox(height: 24),
          const _SectionTitle(title: 'Como funciona'),
          const SizedBox(height: 10),
          Text(
            'O sorteio considera a média de estrelas de cada jogador e alterna a distribuição para deixar os times o mais parelhos possível. Marque quem vai jogar editando o cadastro do jogador.',
            style: TextStyle(color: Colors.blueGrey.shade700, height: 1.45),
          ),
        ],
      ),
    );
  }
}

class RankingsScreen extends StatefulWidget {
  const RankingsScreen({super.key, required this.state});

  final AppState state;

  @override
  State<RankingsScreen> createState() => _RankingsScreenState();
}

class _RankingsScreenState extends State<RankingsScreen> {
  String period = 'Ano';

  DateTime? get start {
    final now = DateTime.now();
    if (period == 'Semana') return now.subtract(const Duration(days: 7));
    if (period == 'Mês') return DateTime(now.year, now.month - 1, now.day);
    return DateTime(now.year, 1, 1);
  }

  @override
  Widget build(BuildContext context) {
    final scorers = widget.state.rankingByGoals(start: start);
    final keepers = widget.state.rankingByGoalkeeper(start: start);
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Rankings', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
        children: [
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'Semana', label: Text('Semana')),
              ButtonSegment(value: 'Mês', label: Text('Mês')),
              ButtonSegment(value: 'Ano', label: Text('Ano')),
            ],
            selected: {period},
            onSelectionChanged: (values) => setState(() => period = values.first),
          ),
          const SizedBox(height: 24),
          const _SectionTitle(title: 'Artilheiros'),
          const SizedBox(height: 10),
          RankingList(players: scorers, value: (player) => '${widget.state.goalsFor(player.id, start: start)} gols'),
          const SizedBox(height: 24),
          const _SectionTitle(title: 'Melhores goleiros'),
          const SizedBox(height: 10),
          RankingList(players: keepers, value: (player) => '${widget.state.goalkeeperAwardsFor(player.id, start: start)} prêmio(s)'),
          if (scorers.isEmpty && keepers.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 45),
              child: Center(child: Text('Registre uma partida para começar os rankings.')),
            ),
        ],
      ),
    );
  }
}

class RankingList extends StatelessWidget {
  const RankingList({super.key, required this.players, required this.value});

  final List<Player> players;
  final String Function(Player player) value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          for (var index = 0; index < players.length; index++)
            ListTile(
              leading: CircleAvatar(
                backgroundColor: index == 0 ? const Color(0xFFFFE6AA) : const Color(0xFFEAF0FC),
                child: Text('${index + 1}', style: const TextStyle(fontWeight: FontWeight.w800)),
              ),
              title: Text(players[index].name, style: const TextStyle(fontWeight: FontWeight.w700)),
              trailing: Text(value(players[index]), style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF2457D6))),
            ),
          if (players.isEmpty)
            const Padding(
              padding: EdgeInsets.all(22),
              child: Text('Nenhum resultado neste período.'),
            ),
        ],
      ),
    );
  }
}

class PlayerTile extends StatelessWidget {
  const PlayerTile({super.key, required this.player, required this.state, required this.onTap});

  final Player player;
  final AppState state;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final team = state.teams.where((item) => item.id == player.teamId).firstOrNull;
    return Card(
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: CircleAvatar(
          backgroundColor: const Color(0xFFEAF0FC),
          child: Text(player.name.substring(0, 1).toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF2457D6))),
        ),
        title: Text(player.name, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text('${player.strongestPosition.label} • ${team?.name ?? 'Sem time'}'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            StarRating(value: player.ratingFor(player.strongestPosition)),
            const SizedBox(height: 3),
            Text(player.present ? 'Presente' : 'Ausente', style: TextStyle(fontSize: 11, color: player.present ? const Color(0xFF249477) : Colors.blueGrey)),
          ],
        ),
      ),
    );
  }
}

class StarRating extends StatelessWidget {
  const StarRating({super.key, required this.value});

  final int value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var index = 0; index < 3; index++)
          Icon(Icons.star_rounded, size: 16, color: index < value ? const Color(0xFFF2B544) : const Color(0xFFD9E0EA)),
      ],
    );
  }
}

class _TeamDrawCard extends StatelessWidget {
  const _TeamDrawCard({required this.title, required this.color, required this.players, required this.rating});

  final String title;
  final Color color;
  final List<Player> players;
  final double rating;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 16, 14, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(radius: 7, backgroundColor: color),
                const SizedBox(width: 7),
                Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w800))),
              ],
            ),
            const SizedBox(height: 5),
            Text('${rating.toStringAsFixed(1)} média', style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade600)),
            const Divider(height: 22),
            for (final player in players)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(player.name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
              ),
          ],
        ),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFF2457D6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Próximo jogo', style: TextStyle(color: Colors.white70)),
                    const SizedBox(height: 7),
                    const Text('Faça o sorteio da rodada', style: TextStyle(color: Colors.white, fontSize: 21, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 14),
                    FilledButton(
                      onPressed: onTap,
                      style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: const Color(0xFF2457D6)),
                      child: const Text('Começar agora'),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.shuffle_rounded, color: Colors.white, size: 64),
            ],
          ),
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value, required this.icon});

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFF2457D6)),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
                Text(label, style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade600)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _HighlightCard extends StatelessWidget {
  const _HighlightCard({required this.icon, required this.color, required this.title, required this.name, required this.detail});

  final IconData icon;
  final Color color;
  final String title;
  final String name;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: CircleAvatar(backgroundColor: color.withOpacity(.14), child: Icon(icon, color: color)),
        title: Text(title.toUpperCase(), style: TextStyle(fontSize: 11, letterSpacing: .8, color: color, fontWeight: FontWeight.w800)),
        subtitle: Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        trailing: Text(detail, textAlign: TextAlign.end, style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade600)),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(title, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800, color: Color(0xFF14233B)));
  }
}

Future<void> showTeamEditor(BuildContext context, AppState state, {Team? team}) async {
  final controller = TextEditingController(text: team?.name ?? '');
  await showDialog<void>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(team == null ? 'Novo time' : 'Editar time'),
      content: TextField(
        controller: controller,
        autofocus: true,
        decoration: const InputDecoration(labelText: 'Nome do time'),
        textCapitalization: TextCapitalization.words,
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Cancelar')),
        FilledButton(
          onPressed: () async {
            if (controller.text.trim().isEmpty) return;
            if (team == null) {
              await state.addTeam(controller.text);
            } else {
              await state.updateTeam(team, controller.text);
            }
            if (dialogContext.mounted) Navigator.pop(dialogContext);
          },
          child: const Text('Salvar'),
        ),
      ],
    ),
  );
  controller.dispose();
}

Future<void> showPlayerEditor(BuildContext context, AppState state, {Player? player}) async {
  final nameController = TextEditingController(text: player?.name ?? '');
  String selectedTeam = player?.teamId ?? '';
  bool present = player?.present ?? true;
  final ratings = {
    for (final position in PlayerPosition.values) position: player?.ratingFor(position) ?? 0,
  };

  await showDialog<void>(
    context: context,
    builder: (dialogContext) => StatefulBuilder(
      builder: (context, setState) {
        return AlertDialog(
          title: Text(player == null ? 'Novo jogador' : 'Editar jogador'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  autofocus: true,
                  decoration: const InputDecoration(labelText: 'Nome'),
                  textCapitalization: TextCapitalization.words,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: selectedTeam,
                  decoration: const InputDecoration(labelText: 'Time'),
                  items: [
                    const DropdownMenuItem(value: '', child: Text('Sem time')),
                    ...state.teams.map((team) => DropdownMenuItem(value: team.id, child: Text(team.name))),
                  ],
                  onChanged: (value) => setState(() => selectedTeam = value ?? ''),
                ),
                const SizedBox(height: 14),
                for (final position in PlayerPosition.values)
                  _RatingPicker(
                    position: position,
                    value: ratings[position] ?? 0,
                    onChanged: (value) => setState(() => ratings[position] = value),
                  ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Vai jogar hoje?'),
                  value: present,
                  onChanged: (value) => setState(() => present = value),
                ),
              ],
            ),
          ),
          actions: [
            if (player != null)
              TextButton(
                onPressed: () async {
                  await state.removePlayer(player);
                  if (dialogContext.mounted) Navigator.pop(dialogContext);
                },
                child: const Text('Excluir', style: TextStyle(color: Colors.red)),
              ),
            TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Cancelar')),
            FilledButton(
              onPressed: () async {
                if (nameController.text.trim().isEmpty) return;
                final normalizedRatings = Map<PlayerPosition, int>.from(ratings);
                if (player == null) {
                  await state.addPlayer(
                    name: nameController.text,
                    teamId: selectedTeam.isEmpty ? null : selectedTeam,
                    ratings: normalizedRatings,
                    present: present,
                  );
                } else {
                  player.present = present;
                  await state.updatePlayer(
                    player,
                    name: nameController.text,
                    teamId: selectedTeam.isEmpty ? null : selectedTeam,
                    ratings: normalizedRatings,
                  );
                }
                if (dialogContext.mounted) Navigator.pop(dialogContext);
              },
              child: const Text('Salvar'),
            ),
          ],
        );
      },
    ),
  );
  nameController.dispose();
}

class _RatingPicker extends StatelessWidget {
  const _RatingPicker({required this.position, required this.value, required this.onChanged});

  final PlayerPosition position;
  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(child: Text(position.label)),
          for (var index = 0; index <= 3; index++)
            IconButton(
              visualDensity: VisualDensity.compact,
              onPressed: () => onChanged(index),
              icon: Icon(index == 0 ? Icons.remove_circle_outline_rounded : Icons.star_rounded, color: index == 0 ? Colors.blueGrey : (index <= value ? const Color(0xFFF2B544) : const Color(0xFFD9E0EA))),
              tooltip: index == 0 ? 'Sem avaliação' : '$index estrela(s)',
            ),
        ],
      ),
    );
  }
}

Future<void> showMatchEditor(BuildContext context, AppState state, DrawResult draw) async {
  final scoreAController = TextEditingController(text: '0');
  final scoreBController = TextEditingController(text: '0');
  String? bestGoalkeeperId;
  final goals = {
    for (final player in [...draw.teamA, ...draw.teamB]) player.id: 0,
  };
  await showDialog<void>(
    context: context,
    builder: (dialogContext) => StatefulBuilder(
      builder: (context, setState) {
        final keepers = [...draw.teamA, ...draw.teamB]
            .where((player) => player.strongestPosition == PlayerPosition.goalkeeper)
            .toList();
        return AlertDialog(
          title: const Text('Registrar partida'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: TextField(controller: scoreAController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Azul'))),
                    const Padding(padding: EdgeInsets.symmetric(horizontal: 10), child: Text('x')),
                    Expanded(child: TextField(controller: scoreBController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Laranja'))),
                  ],
                ),
                const SizedBox(height: 18),
                const Text('Gols por jogador', style: TextStyle(fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                for (final player in [...draw.teamA, ...draw.teamB])
                  Row(
                    children: [
                      Expanded(child: Text(player.name)),
                      IconButton(onPressed: () => setState(() => goals[player.id] = (goals[player.id] ?? 0) > 0 ? (goals[player.id] ?? 0) - 1 : 0), icon: const Icon(Icons.remove_circle_outline_rounded)),
                      Text('${goals[player.id]}', style: const TextStyle(fontWeight: FontWeight.w800)),
                      IconButton(onPressed: () => setState(() => goals[player.id] = (goals[player.id] ?? 0) + 1), icon: const Icon(Icons.add_circle_outline_rounded)),
                    ],
                  ),
                if (keepers.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String?>(
                    value: bestGoalkeeperId,
                    decoration: const InputDecoration(labelText: 'Melhor goleiro da partida'),
                    items: [
                      const DropdownMenuItem<String?>(
                        value: null,
                        child: Text('Não escolher agora'),
                      ),
                      ...keepers.map(
                        (player) => DropdownMenuItem<String?>(
                          value: player.id,
                          child: Text(player.name),
                        ),
                      ),
                    ],
                    onChanged: (value) => setState(() => bestGoalkeeperId = value),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Cancelar')),
            FilledButton(
              onPressed: () async {
                await state.addMatch(
                  teamA: draw.teamA,
                  teamB: draw.teamB,
                  scoreA: int.tryParse(scoreAController.text) ?? 0,
                  scoreB: int.tryParse(scoreBController.text) ?? 0,
                  goalsByPlayer: Map.fromEntries(goals.entries.where((entry) => entry.value > 0)),
                  bestGoalkeeperId: bestGoalkeeperId,
                );
                if (dialogContext.mounted) Navigator.pop(dialogContext);
              },
              child: const Text('Salvar partida'),
            ),
          ],
        );
      },
    ),
  );
  scoreAController.dispose();
  scoreBController.dispose();
}

extension FirstOrNullExtension<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}